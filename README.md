# Effects of Privacy-Driven Data Leverage on Recommender System Performance

## Overview

As recommender systems become more integrated into digital platforms, privacy concerns around data collection grow. Our project explores how withholding or altering user data impacts the performance of recommendation algorithms. We analyze the trade-offs between personal privacy protection and algorithmic accuracy while examining the role of social inference in compensating for missing inputs.

## Authors

Nida Anwar, Efe Erhan, Katya Kubyshkin, Zoe Stanley\
Simon Fraser University, School of Computing Science\
April 3rd, 2025

## Research Focus

Our study investigates:

- How privacy-driven data withholding ("leverage") affects recommender system performance.
- The impact of training a recommendation model on different combinations of demographic features.

## Methods

We implement a recommender system using:

- **Algorithms:** Alternating Least Squares (matrix factorization), KMeans (clustering)
- **Data sources:** MovieLens 1M (rating.csv, user.csv)
- **Analysis Techniques:** Feature exclusion, subsampling, and RMSE performance comparisons.

## Key Findings

- Including more user data improves recommendation accuracy, but some features are more influential than others.

## Privacy Visualization Tool

We developed a **Feature Impact Visualizer**, which provides insights into how individual data attributes affect recommendation performance. This tool aims to increase user awareness of data-driven personalization by demonstrating the empirical risk delta between models that use more or less demographic information.

## Contribution Statement

All team members contributed equally, collaborating on research, implementation, and documentation. Specific roles included:

- **Recommender system development:** Efe, Katya
- **Front-end visualization tool:** Katya
- **Report writing and analysis:** Zoe, Nida, Katya, Efe

## References

Our research builds on work in data governance, machine learning, and human-centered AI. See our full report for citations and further reading.

## License

This project is licensed under the MIT License.

## Contact

For inquiries or contributions, please contact us via GitHub Issues or email.

