from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load model and scaler
MODEL_PATH = "model/model.pkl"
SCALER_PATH = "model/scaler.pkl"

if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
    print("Error: Model or Scaler not found!")
    exit(1)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # 1. Extract values
        age = float(data.get('age'))
        gender = int(data.get('gender'))
        height = float(data.get('height'))
        weight = float(data.get('weight'))
        ap_hi = float(data.get('ap_hi'))
        ap_lo = float(data.get('ap_lo'))
        cholesterol = int(data.get('cholesterol'))
        gluc = int(data.get('gluc'))
        smoke = int(data.get('smoke'))
        alco = int(data.get('alco'))
        active = int(data.get('active'))
        
        # 2. Derive BMI
        bmi = weight / ((height / 100) ** 2)
        
        # 3. Create feature vector in training order:
        # [age, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active, bmi]
        features = np.array([[
            age, gender, height, weight, ap_hi, ap_lo, 
            cholesterol, gluc, smoke, alco, active, bmi
        ]])
        
        # 4. Scale features
        features_scaled = scaler.transform(features)
        
        # 5. Predict probability
        # [prob_low, prob_high]
        prob = model.predict_proba(features_scaled)[0][1]
        prob_percent = round(prob * 100, 1)
        
        # 6. Determine Risk Level
        if prob_percent < 30:
            level = "Low"
            color = "#4e7a61" # Sage Green
        elif prob_percent < 70:
            level = "Moderate"
            color = "#e9c46a" # Warm Yellow
        else:
            level = "High"
            color = "#d27d7d" # Soft Red
            
        return jsonify({
            "success": True,
            "level": level,
            "probability": prob_percent,
            "color": color,
            "accuracy": 73.0,  # From Training_Testing.ipynb Random Forest result
            "precision": 76.0,
            "recall": 68.0,
            "f1": 72.0
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    # Running on local for development
    app.run(debug=True, port=5005)
