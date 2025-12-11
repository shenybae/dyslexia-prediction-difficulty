from flask import Flask, request, jsonify
import pickle
import pandas as pd

# Load model, scaler, and label encoder
with open("model/best_mobile_dyslexia_model_20k.pkl", "rb") as f:
    model = pickle.load(f)
with open("model/best_mobile_dyslexia_model_20k_scaler.pkl", "rb") as f:
    scaler = pickle.load(f)
with open("model/best_mobile_dyslexia_model_20k_labels.pkl", "rb") as f:
    label_encoder = pickle.load(f)

app = Flask(__name__)

@app.route("/")
def home():
    return "Dyslexia Prediction API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    try:
        # Expecting JSON with feature keys
        features = [
            'age', 'word_recognition_speed', 'letter_accuracy', 
            'phoneme_matching', 'word_sequencing', 'reading_comprehension',
            'working_memory_span', 'visual_processing_speed', 'spelling_recognition'
        ]
        
        sample = pd.DataFrame([data])[features]
        sample_scaled = scaler.transform(sample)
        prediction = model.predict(sample_scaled)
        predicted_class = label_encoder.inverse_transform(prediction)[0]

        # Probability if available
        probabilities = None
        if hasattr(model, "predict_proba"):
            prob = model.predict_proba(sample_scaled)[0]
            probabilities = {label_encoder.classes_[i]: float(prob[i]) for i in range(len(prob))}

        return jsonify({
            "predicted_class": predicted_class,
            "probabilities": probabilities
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
