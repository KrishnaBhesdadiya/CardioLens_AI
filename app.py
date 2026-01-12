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
    data = request.get_json()

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

        # -------- Model Input Order (MATCH TRAINING) --------
        numeric_features = np.array([
            age, height, weight, ap_hi, ap_lo, bmi
        ]).reshape(1, -1)

        categorical_features = np.array([
            gender, cholesterol, gluc, smoke, alco, active
        ]).reshape(1, -1)

        final_input = np.hstack((numeric_features, categorical_features))

        # -------- Prediction --------
        prediction = int(model.predict(final_input)[0])
        probability = float(model.predict_proba(final_input)[0][1])

        # -------- Risk Mapping --------
        if probability >= 0.7:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # -------- Response (Frontend Contract) --------
        return jsonify({
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_level
        })

    except Exception as e:
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500


# ===============================
# Run App
# ===============================
if __name__ == "__main__":
    app.run(debug=True)
