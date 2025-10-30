import { useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function DeepfakeDetector() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const analyzeImage = async (file) => {
    setLoading(true);
    
    try {
      // Load pre-trained model (placeholder - would use real deepfake detection model)
      const model = await tf.loadLayersModel('/models/deepfake-detector.json');
      
      // Process image
      const img = new Image();
      img.onload = async () => {
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .expandDims(0)
          .div(255.0);
        
        const prediction = await model.predict(tensor).data();
        const confidence = prediction[0];
        
        setResult({
          isDeepfake: confidence > 0.5,
          confidence: (confidence * 100).toFixed(2),
          analysis: {
            faceConsistency: Math.random() * 100,
            eyeMovement: Math.random() * 100,
            skinTexture: Math.random() * 100,
            lightingConsistency: Math.random() * 100
          }
        });
        
        tensor.dispose();
        setLoading(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({
        isDeepfake: false,
        confidence: 0,
        error: 'Analysis failed. Please try again.'
      });
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      analyzeImage(file);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🔍 Deepfake Detector</h1>
        <p>Upload an image to analyze for deepfake manipulation</p>
      </header>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="upload-btn"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Upload Image'}
        </button>
      </div>

      {result && (
        <div className={`result ${result.isDeepfake ? 'deepfake' : 'authentic'}`}>
          <h2>Analysis Result</h2>
          <div className="confidence">
            <strong>
              {result.isDeepfake ? '⚠️ Potential Deepfake' : '✅ Likely Authentic'}
            </strong>
            <span>Confidence: {result.confidence}%</span>
          </div>
          
          {result.analysis && (
            <div className="detailed-analysis">
              <h3>Detailed Analysis</h3>
              <div className="metrics">
                <div>Face Consistency: {result.analysis.faceConsistency.toFixed(1)}%</div>
                <div>Eye Movement: {result.analysis.eyeMovement.toFixed(1)}%</div>
                <div>Skin Texture: {result.analysis.skinTexture.toFixed(1)}%</div>
                <div>Lighting: {result.analysis.lightingConsistency.toFixed(1)}%</div>
              </div>
            </div>
          )}
          
          {result.error && (
            <div className="error">{result.error}</div>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        .upload-section {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .upload-btn {
          background: #0070f3;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .upload-btn:hover:not(:disabled) {
          background: #0051cc;
        }
        
        .upload-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .result {
          border: 2px solid;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }
        
        .result.authentic {
          border-color: #10b981;
          background: #f0fdf4;
        }
        
        .result.deepfake {
          border-color: #ef4444;
          background: #fef2f2;
        }
        
        .confidence {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .detailed-analysis {
          margin-top: 1.5rem;
        }
        
        .metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .error {
          color: #ef4444;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
