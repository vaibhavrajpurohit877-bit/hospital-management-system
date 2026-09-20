from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # allows your React frontend to call this API

print("Loading model... this may take a moment")
classifier = pipeline(
    "image-classification",
    model="lxyuan/vit-xray-pneumonia-classification"
)
print("Model loaded successfully")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert('RGB')

        results = classifier(image)
        # results looks like: [{'label': 'PNEUMONIA', 'score': 0.99}, {'label': 'NORMAL', 'score': 0.01}]

        top_result = max(results, key=lambda x: x['score'])

        return jsonify({
            "prediction": top_result['label'],
            "confidence": round(top_result['score'] * 100, 2),
            "allScores": results
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))