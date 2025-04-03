# Privacy-Aware Recommender Systems
Read the full writeup [here](https://docs.google.com/document/d/1YgTmmIbc2vnWrUEzgu6B2JCrUGZYtJbPjWg0UrSgCzs/edit?usp=sharing).

## Overview
Recommender systems play a foundational role in modern digital platforms, leveraging both explicit and implicit user data to provide personalized content. However, the extensive data collection required for these systems has raised significant privacy concerns. Our project investigates the impact of privacy-driven data withholding on the performance of recommender systems and explores the trade-offs between individual privacy, system utility, and data governance.

## Objectives
This study aims to:
- Analyze the consequences of privacy-preserving behaviors (e.g., data withholding, obfuscation) on recommendation system performance.
- Explore how recommender systems compensate for missing data using social inference techniques.
- Develop a Privacy Visualization Tool (PVT) to enhance user awareness and autonomy over their personal data usage in recommendation algorithms.
- Examine the role of data governance in ensuring ethical, transparent, and accountable AI-driven recommendations.

## Methodology
We construct two interdependent systems:
1. **Privacy Visualization Tool (PVT):** Enables users to see the effect of withholding personal information on recommendation accuracy.
2. **Recommender System:** Built using the **MovieLens dataset**, this system estimates changes in recommendations based on varying levels of data withholding.

### Data Processing
- **Dataset:** MovieLens (user ratings and demographic data)
- **Technologies Used:** Python, Pandas, PySpark, Flask, React
- **Steps:**
  - Import `user.csv` and `rating.csv` into PySpark DataFrames.
  - Encode categorical demographic features.
  - Apply **KMeans clustering** with 20 clusters.
  - Train the recommendation model iteratively over **256 scenarios**: 8 feature combinations times 32 linearly-spaced subset sizes from 20% to 100%.
  - Visualize RMSE results via an interactive UI.

## Key Finding
- Withholding demographic data reduces recommendation accuracy, most notable at lower data sample sizes, affirming the role of personal data in improving content filtering.

## Conclusion
Understanding how personal data influences recommender systems is crucial for both users and researchers. By visualizing the trade-offs between privacy, recommendation performance, and **data governance**, we hope to empower individuals to make informed decisions about their digital footprints. This project contributes to the ongoing discourse on human-centered AI, data governance, and privacy-preserving technologies, advocating for stronger ethical oversight and user agency in digital ecosystems.
