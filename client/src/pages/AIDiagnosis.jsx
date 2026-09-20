import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function AIDiagnosis() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setError('');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const aiRes = await axios.post(
        `${import.meta.env.VITE_AI_API_URL}/predict`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { prediction, confidence } = aiRes.data;
      setResult({ prediction, confidence });

      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports`,
        { prediction, confidence, imageName: selectedFile.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to analyze image. Please make sure the AI service is running.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const isPneumonia = result?.prediction === 'PNEUMONIA';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI X-Ray Diagnosis</h1>
          <p className="mt-2 text-gray-600">
            Upload a chest X-ray image to get an AI-assisted pneumonia screening
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm">
          ⚠️ This is an AI-assisted screening tool for informational purposes only. It does not replace professional medical diagnosis — always consult a doctor.
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <label
            htmlFor="xray-upload"
            className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="X-ray preview" className="max-h-64 mx-auto rounded-lg" />
            ) : (
              <>
                <div className="text-4xl mb-2">📤</div>
                <p className="text-gray-600 font-medium">Click to upload a chest X-ray image</p>
                <p className="text-gray-400 text-sm mt-1">JPG or PNG</p>
              </>
            )}
            <input
              id="xray-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze X-Ray'}
            </button>
          )}

          {error && (
            <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {result && (
            <div
              className={`mt-6 rounded-xl p-6 border ${
                isPneumonia ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">Result</p>
              <h2 className={`text-2xl font-bold ${isPneumonia ? 'text-red-700' : 'text-green-700'}`}>
                {result.prediction === 'PNEUMONIA' ? 'Pneumonia Detected' : 'Normal'}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Confidence: <span className="font-semibold">{result.confidence}%</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIDiagnosis;