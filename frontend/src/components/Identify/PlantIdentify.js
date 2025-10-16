import React, { useState } from 'react';
import './PlantIdentify.css';

const PlantIdentify = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleIdentify = async () => {
    if (!image) return;
    setLoading(true);
    setTimeout(() => {
      setResult({
        name: 'Aloe Vera',
        confidence: 0.94,
        benefits: ['Skin healing', 'Air purification', 'Anti-inflammatory'],
        care: ['Bright indirect light', 'Water every 2-3 weeks', 'Well-draining soil']
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="identify">
      <div className="container">
        <div className="identify-card">
          <h1>Identify a Plant</h1>
          <p>Upload a photo and get instant AI-powered identification.</p>

          <div className="upload">
            <input id="file" type="file" accept="image/*" onChange={handleFile} hidden />
            <label htmlFor="file" className="upload-btn">
              <span className="material-icons">upload</span>
              Choose Photo
            </label>
            {preview && (
              <button className="clear-btn" onClick={() => { setPreview(''); setImage(null); setResult(null); }}>
                <span className="material-icons">close</span>
                Clear
              </button>
            )}
          </div>

          {preview && (
            <div className="preview">
              <img src={preview} alt="preview" />
            </div>
          )}

          <button className="identify-btn" onClick={handleIdentify} disabled={!image || loading}>
            {loading ? 'Analyzing...' : 'Identify Plant'}
          </button>

          {result && (
            <div className="result">
              <h2>{result.name}</h2>
              <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              <div className="grid">
                <div>
                  <h3>Benefits</h3>
                  <ul>
                    {result.benefits.map((b,i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
                <div>
                  <h3>Care</h3>
                  <ul>
                    {result.care.map((c,i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantIdentify;

































