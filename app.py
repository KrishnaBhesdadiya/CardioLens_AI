from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__, static_folder="Frontend", static_url_path="")

# ===============================
# Load trained model
# ===============================
MODEL_PATH = "model/model.pkl"
model = joblib.load(MODEL_PATH)
SCALER_PATH = "model/scaler.pkl"
scaler = joblib.load(SCALER_PATH)

# ===============================
# Serve UI Pages
# ===============================
@app.route("/")
def home():
    return send_from_directory("Frontend", "index.html")

@app.route("/<path:filename>")
def serve_ui(filename):
    return send_from_directory("Frontend", filename)

# ===============================
# Prediction API
# ===============================
@app.route("/predict", methods=["POST"])
def predict():
    print(">>> Prediction request received")
    data = request.get_json()
    print(f">>> Data: {data}")

    try:
        # -------- Numeric Inputs --------
        age = int(data["age"])
        gender = int(data["gender"])
        height = int(data["height"])
        weight = float(data["weight"])
        ap_hi = int(data["ap_hi"])
        ap_lo = int(data["ap_lo"])
        cholesterol = int(data["cholesterol"])
        gluc = int(data["gluc"])
        smoke = int(data["smoke"])
        alco = int(data["alco"])
        active = int(data["active"])

        # -------- Feature Engineering --------
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
        prediction = int(model.predict(features_scaled)[0])
        prob = model.predict_proba(features_scaled)[0][1]
        prob_percent = round(prob * 100, 1)
        
        # 6. Determine Risk Level
        if prob_percent < 40:
            level = "Low"
            color = "#4e7a61" # Sage Green
        elif prob_percent < 70:
            level = "Moderate"
            color = "#e9c46a" # Warm Yellow
        else:
            level = "High"
            color = "#d27d7d" # Soft Red

        # -------- Response (Frontend Contract) --------
        print(">>> Prediction successful")
        return jsonify({
            "success": True,
            "prediction": prediction,
            "probability": prob_percent,
            "level": level,
            "color": color,
            "accuracy": 73.0,  # From Training_Testing.ipynb Random Forest result
            "precision": 76.0,
            "recall": 68.0,
            "f1": 72.0
        })

    except Exception as e:
        print(f">>> Prediction failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": "Prediction failed",
            "details": str(e)
        }), 500


# ===============================
# Run App
# ===============================
if __name__ == "__main__":
    app.run(debug=True)

