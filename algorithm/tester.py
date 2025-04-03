import pandas as pd
import numpy as np

from pyspark.sql import SparkSession
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.recommendation import ALS
import findspark

from trainer import Trainer
import os.path
import sys

def main():
    args = sys.argv
    if args[1] is None or args[2] is None:
        raise ValueError('Args not valid. Correct usage requires Fractions index and Column index')
    
    arg1 = int(args[1])
    arg2 = int(args[2])
    
    fractions = np.linspace(0.2,1.0,32)
    frac_to_use = fractions[arg1]
    columns_to_use = []
    rating = pd.read_csv('data/ratings.dat', delimiter='::', header=None, engine='python', names=['UserID','MovieID','Rating','Timestamp'])[['UserID','MovieID','Rating']]
    rating_subsample = rating.sample(frac=frac_to_use).reset_index()

    session = SparkSession.builder.appName("HybridRecommender").getOrCreate()
    findspark.find()

    if args[2] == '-1':
        train = rating_subsample.sample(frac=0.8)
        test = rating_subsample.iloc[rating_subsample.index.difference(train.index)]

        train = session.createDataFrame(train)
        test = session.createDataFrame(test)

        als = ALS(userCol="UserID", itemCol="MovieID", ratingCol="Rating", coldStartStrategy="drop")
        als_model = als.fit(train)
        predictions = als_model.transform(test)
        evaluator = RegressionEvaluator(metricName="rmse", labelCol="Rating", predictionCol="prediction")
        rmse = evaluator.evaluate(predictions)

    else:

        columns_powerset = [
            ['Age'], ['Gender'], ['Occupation'],
            ['Age', 'Gender'], ['Gender', 'Occupation'], ['Age', 'Occupation'],
            ['Age','Gender','Occupation']
        ]

        columns_to_use = columns_powerset[arg2]

        user = pd.read_csv('data/users.dat', delimiter='::', header=None, index_col=0, engine='python', names=['UserID','Gender','Age','Occupation','Zip-code']).reset_index()
        user['Gender'] = user['Gender'].map({'M': 0, 'F': 1})

        user_subsample = user[['UserID']+columns_to_use]
        user_subsample = pd.merge(left=user_subsample, right=rating_subsample[['UserID']], on='UserID')

        user_df = session.createDataFrame(user)
        rating_df = session.createDataFrame(rating)
            
        t = Trainer(spark_session=session)
        t.fit(user=user_df, rating=rating_df, cols=columns_to_use)
        rmse = t.predict()
    
    res_df = None
    if os.path.isfile('res.csv'):
        res_df = pd.read_csv('res.csv')
    else:
        res_df = pd.DataFrame(columns=['Gender', 'Age', 'Occupation', 'subsample_fraction', 'RMSE'])

    vals = [[
        'Gender' in columns_to_use,
        'Age' in columns_to_use,
        'Occupation' in columns_to_use,
         frac_to_use,
         rmse
    ]]
    
    new_row = pd.DataFrame(vals,columns=['Gender', 'Age', 'Occupation', 'subsample_fraction', 'RMSE'])
    res_df = pd.concat([res_df, new_row])
    res_df.to_csv('res.csv',index=False)
    session.stop()

if __name__ == '__main__':
    main()
