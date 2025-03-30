from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import pandas as pd
import os

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://your-frontend-domain.netlify.app",  # Replace with your actual frontend URL
            "https://your-frontend-domain.vercel.app"     # Replace with your actual frontend URL
        ],
        "methods": ["GET"],
        "allow_headers": ["Content-Type"]
    }
})

df = pd.read_csv('res.csv')

def get_bool(val):
    return str(val).lower() == 'true'

@app.route('/get_rmse_data', methods=['GET'])
def get_rmse_data():
    # Get request parameters 
    gender_param = request.args.get('gender')
    age_param = request.args.get('age')
    occupation_param = request.args.get('occupation')

    if None in [gender_param, age_param, occupation_param]:
        return jsonify({"error": "Missing one or more parameters: gender, age, occupation"}), 400

    # Get boolean values
    try:
        gender = get_bool(gender_param)
        age = get_bool(age_param)
        occupation = get_bool(occupation_param)
    except Exception as e:
        return jsonify({"error": f"Invalid parameter value: {str(e)}"}), 400

    # Filter the dataframe based on the selected boolean features
    filtered_df = df[
        (df['Gender'] == gender) &
        (df['Age'] == age) &
        (df['Occupation'] == occupation)
    ]

    if filtered_df.empty:
        return jsonify({"error": "No matching records found"}), 404

    # Sort by subsample_fraction and transform response to dictionary format for JSON serialization 
    filtered_df = filtered_df.sort_values('subsample_fraction')
    data = filtered_df[['subsample_fraction', 'RMSE']].to_dict('records')
    
    # Return the requested feature data as well as a unique sorted list of subset sizes
    response = {
        "data": data,
        "subset_sizes": sorted(filtered_df['subsample_fraction'].unique().tolist())
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5001)