from flask import Flask, request, jsonify
import pickle
import pandas as pd

# Load model
with open('best_mobile_dyslexia_model_20k.pkl', 'rb') as f:
    model = pickle.load(f)
with open('best_mobile_dyslexia_model_20k_scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
with open('best_mobile_dyslexia_model_20k_labels.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    X_new = pd.DataFrame([data])
    X_new_scaled = scaler.transform(X_new)
    pred = model.predict(X_new_scaled)
    predicted_class = label_encoder.inverse_transform(pred)[0]
    return jsonify({'predicted_difficulty': predicted_class})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
