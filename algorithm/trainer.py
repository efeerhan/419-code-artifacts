from pyspark.sql import SparkSession, DataFrame
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.clustering import KMeans
from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator
from typing import Sequence
import gc

class Trainer():
    def __init__(self, spark_session: SparkSession = None, K: int = 20):
        self.session = spark_session
        self.cluster_rmse = {}
        self.evaluator = RegressionEvaluator(metricName="rmse", labelCol="Rating", predictionCol="prediction")
        self.predictions = []
        self.clustering = None
        self.datasets = {}
        self.K = K

    def fit(self, user: DataFrame = None, rating: DataFrame = None, cols: Sequence[str] = None):
        if user is None or rating is None:
            raise ValueError("user and rating must be provided")
        
        if cols is None:
            cols = user_train.schema.names

        vec_assembler = VectorAssembler(inputCols=cols, outputCol="features")
        user_df = vec_assembler.transform(user)
        del vec_assembler

        kmeans = KMeans(featuresCol="features", predictionCol="Cluster", k=self.K)
        kmeans_model = kmeans.fit(user_df)
        user_df = kmeans_model.transform(user_df)
        del kmeans_model

        join = rating.join(user_df.select("UserID", "Cluster"), on="UserID")

        train, test = join.randomSplit([0.8, 0.2], seed=42)
        self.datasets['train'] = train
        self.datasets['test'] = test
        del user_df

        gc.collect()

        return self

    def predict(self) -> float:

        predictions_list = []

        train_df = self.datasets['train']
        test_df = self.datasets['test']

        for cluster_id in range(self.K):
            cluster_train = train_df.filter(train_df.Cluster == cluster_id).drop("Cluster")
            cluster_test = test_df.filter(test_df.Cluster == cluster_id).drop("Cluster")

            if cluster_train.count() > 0 and cluster_test.count() > 0:
                als = ALS(userCol="UserID", itemCol="MovieID", ratingCol="Rating", coldStartStrategy="drop")
                als_model = als.fit(cluster_train)
                cluster_predictions = als_model.transform(cluster_test)
                predictions_list.append(cluster_predictions)
                del als
                del als_model

        if predictions_list:
            predictions_df = predictions_list[0]
            for p in predictions_list[1:]:
                predictions_df = predictions_df.union(p)

            predictions_df = predictions_df.dropna()

            evaluator = RegressionEvaluator(metricName="rmse", labelCol="Rating", predictionCol="prediction")
            rmse = evaluator.evaluate(predictions_df)

            del predictions_df
            del predictions_list
        
        del train_df
        del test_df

        gc.collect()

        return rmse