import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { identifyPlant, listProductsPublic, assetUrl } from '../../lib/api';
import { Alert, CircularProgress, LinearProgress } from '@mui/material';
import './PlantIdentify.css';

const PlantIdentify = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [imageInfo, setImageInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [productMatch, setProductMatch] = useState(null);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle camera stream assignment to video element
  React.useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = cameraStream;
      video.play().catch(err => {
        console.error("Error playing video:", err);
      });
    }
  }, [showCamera, cameraStream]);

  const processFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Image size too large. Please select an image smaller than 10MB.');
      return;
    }

    setImage(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        dimensions: `${img.width} × ${img.height}`,
        type: file.type.split('/')[1].toUpperCase()
      });
    };
    img.src = previewUrl;

    setResult(null);
    setError(null);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleIdentify = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await identifyPlant(image);

      if (response.success && response.results && response.results.length > 0) {
        setResult(response);
      } else {
        setError(response.error || 'No plant species identified. Please try a clearer photo.');
      }
    } catch (err) {
      console.error('Plant identification error:', err);
      let errorMessage = err.message || 'Failed to identify plant. Please try again.';

      // Check if it's an authentication error
      if (errorMessage.includes('authentication') || errorMessage.includes('401') || errorMessage.includes('API key')) {
        errorMessage = 'Plant identification service is not configured. Please contact the administrator to set up the PlantNet API key.';
      }

      // Try to parse JSON error if it's a string
      try {
        const errorObj = JSON.parse(errorMessage);
        if (errorObj.error) {
          errorMessage = errorObj.error;
          if (errorObj.help) {
            errorMessage += ` ${errorObj.help}`;
          }
        }
      } catch (e) {
        // Not JSON, use the original message
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPreview('');
    setImage(null);
    setImageInfo(null);
    setResult(null);
    setError(null);
    setProductMatch(null);
    setProductNotFound(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
  };

  const startCamera = async () => {
    try {
      let stream;
      // Detect if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      const constraints = {
        video: isMobile ? { facingMode: { ideal: 'environment' } } : true
      };

      try {
        console.log("Attempting to start camera with constraints:", constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn('Initial camera access failed, falling back to default:', err);
        // Final fallback: just try to get any video stream
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);
      setShowCamera(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      let msg = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError') msg += 'Please ensure you have given permission.';
      else if (err.name === 'NotFoundError') msg += 'No camera found on this device.';
      else msg += 'Please ensure no other application is using it.';
      setError(msg);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "captured-plant.jpg", { type: "image/jpeg" });
        processFile(file);
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 80) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
  };

  const checkProductAvailability = async () => {
    if (!result || !result.results || result.results.length === 0) return;

    setSearchingProduct(true);
    setProductMatch(null);
    setProductNotFound(false);

    try {
      // Get the best match (first result)
      const bestMatch = result.results[0];
      const searchTerms = [];

      // Add scientific name
      if (bestMatch.scientificName) {
        searchTerms.push(bestMatch.scientificName.toLowerCase());
      }

      // Add common names
      if (bestMatch.commonNames && bestMatch.commonNames.length > 0) {
        searchTerms.push(...bestMatch.commonNames.map(name => name.toLowerCase()));
      }

      // Fetch all products
      const productsResponse = await listProductsPublic();
      const products = productsResponse.products || productsResponse || [];

      // Search for matching product
      let matchedProduct = null;
      for (const product of products) {
        const productName = (product.name || '').toLowerCase();

        // Check if any search term matches the product name
        for (const term of searchTerms) {
          if (productName.includes(term) || term.includes(productName.split(' ')[0])) {
            matchedProduct = product;
            break;
          }
        }

        if (matchedProduct) break;
      }

      if (matchedProduct) {
        setProductMatch(matchedProduct);
        setProductNotFound(false);
      } else {
        setProductMatch(null);
        setProductNotFound(true);
      }
    } catch (err) {
      console.error('Error checking product availability:', err);
      setError('Failed to check product availability. Please try again.');
    } finally {
      setSearchingProduct(false);
    }
  };

  const handleAddToCart = (product) => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already in cart
    const existingIndex = existingCart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      // Increment quantity
      existingCart[existingIndex].quantity += 1;
    } else {
      // Add new product
      existingCart.push({ ...product, quantity: 1 });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));

    // Show success message
    alert('Product added to cart!');
  };

  const handleBuyNow = (product) => {
    // Add to cart first
    handleAddToCart(product);
    // Navigate to cart/checkout
    navigate('/cart');
  };

  const getPlantCareInfo = (plantData) => {
    if (!plantData) return null;

    const scientificName = plantData.scientificName || '';
    const genus = plantData.genus || '';
    const family = plantData.family || '';
    const confidence = plantData.confidence || 0;

    // Default care info structure
    const careInfo = {
      sunlight: {
        level: 'Bright Indirect Light',
        hours: '4-6 hours',
        description: 'Place near a window with filtered sunlight',
        icon: 'wb_sunny'
      },
      watering: {
        frequency: 'Weekly',
        amount: 'Moderate',
        description: 'Water when top inch of soil is dry',
        icon: 'water_drop'
      },
      soil: {
        type: 'Well-draining potting mix',
        ph: '6.0-7.0',
        drainage: 'Good drainage essential',
        icon: 'grass'
      },
      care: {
        temperature: '65-75°F (18-24°C)',
        humidity: '40-60%',
        tips: 'Keep away from cold drafts and heating vents',
        icon: 'thermostat'
      },
      confidence: confidence
    };

    // Customize based on plant family/genus
    const lowerGenus = genus.toLowerCase();
    const lowerFamily = family.toLowerCase();

    // Succulents and Cacti
    if (lowerFamily.includes('cactaceae') || lowerGenus.includes('aloe') ||
      lowerGenus.includes('echeveria') || scientificName.toLowerCase().includes('succulent')) {
      careInfo.sunlight = {
        level: 'Full Sun to Bright Light',
        hours: '6+ hours',
        description: 'Thrives in direct sunlight',
        icon: 'wb_sunny'
      };
      careInfo.watering = {
        frequency: 'Every 2-3 weeks',
        amount: 'Minimal',
        description: 'Allow soil to dry completely between waterings',
        icon: 'water_drop'
      };
      careInfo.soil = {
        type: 'Cactus/succulent mix',
        ph: '6.0-7.5',
        drainage: 'Excellent drainage required',
        icon: 'grass'
      };
    }

    // Ferns
    if (lowerFamily.includes('polypodiaceae') || lowerGenus.includes('nephrolepis') ||
      scientificName.toLowerCase().includes('fern')) {
      careInfo.sunlight = {
        level: 'Shade to Partial Shade',
        hours: '2-4 hours indirect',
        description: 'Avoid direct sunlight',
        icon: 'wb_cloudy'
      };
      careInfo.watering = {
        frequency: '2-3 times per week',
        amount: 'Keep moist',
        description: 'Soil should stay consistently moist',
        icon: 'water_drop'
      };
      careInfo.care.humidity = '60-80% (High)';
    }

    // Snake Plant (Sansevieria)
    if (lowerGenus.includes('sansevieria') || lowerGenus.includes('dracaena')) {
      careInfo.sunlight = {
        level: 'Low to Bright Indirect',
        hours: 'Flexible',
        description: 'Very adaptable to different light conditions',
        icon: 'wb_twilight'
      };
      careInfo.watering = {
        frequency: 'Every 2-3 weeks',
        amount: 'Minimal',
        description: 'Allow soil to dry between waterings',
        icon: 'water_drop'
      };
    }

    // Pothos, Philodendron
    if (lowerGenus.includes('epipremnum') || lowerGenus.includes('philodendron')) {
      careInfo.sunlight = {
        level: 'Medium to Bright Indirect',
        hours: '4-6 hours indirect',
        description: 'Tolerates low light but grows best in bright indirect',
        icon: 'wb_sunny'
      };
      careInfo.watering = {
        frequency: 'Weekly',
        amount: 'Moderate',
        description: 'Water when top 1-2 inches of soil dry',
        icon: 'water_drop'
      };
    }

    // Roses
    if (lowerGenus.includes('rosa') || scientificName.toLowerCase().includes('rose')) {
      careInfo.sunlight = {
        level: 'Full Sun',
        hours: '6+ hours',
        description: 'Needs plenty of direct sunlight daily',
        icon: 'wb_sunny'
      };
      careInfo.watering = {
        frequency: 'Daily to every other day',
        amount: 'Deep watering',
        description: 'Water deeply at the base, avoid wetting leaves',
        icon: 'water_drop'
      };
      careInfo.soil = {
        type: 'Rich, loamy soil',
        ph: '6.0-6.5',
        drainage: 'Well-draining',
        icon: 'grass'
      };
    }

    return careInfo;
  };

  return (
    <div className="identify">
      <div className="container">
        <div className="identify-card">
          <div className="header-section">
            <div className="icon-wrapper">
              <span className="material-icons header-icon">eco</span>
            </div>
            <h1>Identify a Plant</h1>
            <p>Upload a photo and get instant AI-powered identification</p>
          </div>

          {!preview ? (
            <div className={`upload-container ${dragActive ? 'drag-active' : ''}`}>
              <div
                className="upload-drop-zone"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  hidden
                />
                <div className="upload-icon">
                  <span className="material-icons">cloud_upload</span>
                </div>
                <h3>Drag & Drop your image here</h3>
                <p>or click to browse</p>
                <div className="upload-info">
                  <span>Supported: JPG, PNG, WEBP</span>
                  <span>•</span>
                  <span>Max size: 10MB</span>
                </div>
              </div>

              <div className="upload-actions">
                <button
                  className="upload-btn primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-icons">upload_file</span>
                  Browse Files
                </button>
                <button
                  className="upload-btn secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    startCamera();
                  }}
                >
                  <span className="material-icons">photo_camera</span>
                  Take Photo
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Show split-screen layout when results exist */}
              <div className={`content-wrapper ${result && result.results && result.results.length > 0 ? 'split-view' : ''}`}>
                {/* Left Column - Image Preview */}
                <div className="preview-column">
                  <div className="preview-section">
                    <div className="preview-header">
                      <div className="file-info">
                        <span className="material-icons">image</span>
                        <div className="file-details">
                          <div className="file-name">{imageInfo?.name}</div>
                          <div className="file-meta">
                            {imageInfo?.size} • {imageInfo?.dimensions} • {imageInfo?.type}
                          </div>
                        </div>
                      </div>
                      <button className="clear-btn" onClick={handleClear}>
                        <span className="material-icons">close</span>
                      </button>
                    </div>
                    <div className="preview">
                      <img src={preview} alt="preview" />
                    </div>
                  </div>

                  {error && (
                    <Alert severity="error" className="error-alert">
                      {error}
                    </Alert>
                  )}

                  {!result && (
                    <button
                      className="identify-btn"
                      onClick={handleIdentify}
                      disabled={!image || loading}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} className="btn-spinner" />
                          Analyzing Plant...
                        </>
                      ) : (
                        <>
                          <span className="material-icons">search</span>
                          Identify Plant
                        </>
                      )}
                    </button>
                  )}

                  {/* Check Availability Button - Show when results exist */}
                  {result && result.results && result.results.length > 0 && !productMatch && !productNotFound && (
                    <button
                      className="check-availability-btn"
                      onClick={checkProductAvailability}
                      disabled={searchingProduct}
                    >
                      {searchingProduct ? (
                        <>
                          <CircularProgress size={20} className="btn-spinner" />
                          Searching Products...
                        </>
                      ) : (
                        <>
                          <span className="material-icons">inventory_2</span>
                          Check Availability in Store
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Right Column - Results */}
                {result && result.results && result.results.length > 0 && (
                  <div className="results-column">
                    {/* Product Match Card - Now at the Top of Right Column */}
                    {productMatch && (
                      <div className="product-match-card horizontal">
                        <div className="product-match-header">
                          <span className="material-icons">verified</span>
                          <h3>Found in Our Catalog!</h3>
                        </div>
                        <div className="product-match-content">
                          <div className="product-match-image enlarged">
                            <img src={assetUrl(productMatch.images?.[0])} alt={productMatch.name} />
                          </div>
                          <div className="product-match-details">
                            <div className="product-main-info">
                              <h4>{productMatch.name}</h4>
                              <p className="product-scientific">
                                {result.results[0].scientificName && result.results[0].scientificName}
                              </p>
                              <div className="product-match-price-large">₹{productMatch.price}</div>

                              <div className={`product-status-badge ${(productMatch.stock || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                <span className="material-icons">
                                  {(productMatch.stock || 0) > 0 ? 'check_circle' : 'error'}
                                </span>
                                {(productMatch.stock || 0) > 0 ? `${productMatch.stock} Units Available` : 'Out of Stock'}
                              </div>
                            </div>

                            <div className="product-match-actions-horizontal">
                              <button
                                className="product-action-btn buy-now-large"
                                onClick={() => handleBuyNow(productMatch)}
                                disabled={(productMatch.stock || 0) === 0}
                              >
                                <span className="material-icons">flash_on</span>
                                Buy Now
                              </button>
                              <button
                                className="product-action-btn add-to-cart-large"
                                onClick={() => handleAddToCart(productMatch)}
                                disabled={(productMatch.stock || 0) === 0}
                              >
                                <span className="material-icons">shopping_cart</span>
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Product Not Found Message - Now in Right Column */}
                    {productNotFound && (
                      <div className="product-not-found wide">
                        <div className="not-found-flex">
                          <div className="not-found-icon-large">
                            <span className="material-icons">sentiment_very_dissatisfied</span>
                          </div>
                          <div className="not-found-text">
                            <h3>Product Not Available</h3>
                            <p>
                              We found <strong>{result.results[0].scientificName}</strong>
                              {result.results[0].commonNames && result.results[0].commonNames.length > 0 && (
                                <> ({result.results[0].commonNames[0]})</>
                              )}, but it's not currently in our store inventory.
                            </p>
                          </div>
                          <button
                            className="try-again-btn-large"
                            onClick={() => {
                              setProductNotFound(false);
                              setProductMatch(null);
                            }}
                          >
                            <span className="material-icons">search</span>
                            Search Another
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="results-section">
                      <div className="results-header">
                        <span className="material-icons">check_circle</span>
                        <h2>Identification Complete</h2>
                      </div>

                      {/* Show results grid ONLY if availability has NOT been checked yet */}
                      {!(productMatch || productNotFound) && (
                        <>
                          <div className="results-grid">
                            {result.results.map((plant, index) => {
                              const confidenceLevel = getConfidenceLevel(plant.confidence);

                              return (
                                <div
                                  key={index}
                                  className={`plant-card ${index === 0 ? 'best-match' : ''}`}
                                  style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                  {index === 0 && (
                                    <div className="best-match-badge">
                                      <span className="material-icons">star</span>
                                      Best Match
                                    </div>
                                  )}

                                  <div className="plant-card-header">
                                    <div className="plant-icon">
                                      <span className="material-icons">local_florist</span>
                                    </div>
                                    <div className="plant-info">
                                      <h3 className="scientific-name">
                                        {plant.scientificName || 'Unknown Plant'}
                                      </h3>
                                      {plant.scientificNameFull && plant.scientificNameFull !== plant.scientificName && (
                                        <div className="scientific-name-full">{plant.scientificNameFull}</div>
                                      )}
                                    </div>
                                  </div>

                                  <div className={`confidence-section ${confidenceLevel}`}>
                                    <div className="confidence-header">
                                      <span>Confidence Level</span>
                                      <span className="confidence-value">{plant.confidence}%</span>
                                    </div>
                                    <LinearProgress
                                      variant="determinate"
                                      value={plant.confidence}
                                      className={`confidence-bar ${confidenceLevel}`}
                                    />
                                  </div>

                                  {plant.commonNames && plant.commonNames.length > 0 && (
                                    <div className="info-row">
                                      <span className="material-icons">label</span>
                                      <div>
                                        <strong>Common Names</strong>
                                        <p>{plant.commonNames.join(', ')}</p>
                                      </div>
                                    </div>
                                  )}

                                  {plant.genus && (
                                    <div className="info-row">
                                      <span className="material-icons">category</span>
                                      <div>
                                        <strong>Genus</strong>
                                        <p>{plant.genus}</p>
                                      </div>
                                    </div>
                                  )}

                                  {plant.family && (
                                    <div className="info-row">
                                      <span className="material-icons">account_tree</span>
                                      <div>
                                        <strong>Family</strong>
                                        <p>{plant.family}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {result.results.length > 1 && (
                            <div className="results-footer">
                              <span className="material-icons">info</span>
                              <p>Showing top {result.results.length} matches. Results are ordered by confidence level.</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Plant Care Information Cards - Show ONLY after checking availability */}
                      {(productMatch || productNotFound) && (() => {
                        const careInfo = getPlantCareInfo(result.results[0]);
                        if (!careInfo) return null;

                        return (
                          <div className="plant-care-section" style={{ marginTop: 0 }}>
                            <div className="care-section-header">
                              <span className="material-icons">spa</span>
                              <h3>Plant Care Information</h3>
                            </div>

                            <div className="plant-care-grid">
                              {/* Sunlight Card */}
                              <div className="care-card sunlight-card">
                                <div className="care-card-icon">
                                  <span className="material-icons">{careInfo.sunlight.icon}</span>
                                </div>
                                <h4>Sunlight</h4>
                                <div className="care-card-content">
                                  <div className="care-value">{careInfo.sunlight.level}</div>
                                  <div className="care-detail">{careInfo.sunlight.hours}</div>
                                  <p className="care-description">{careInfo.sunlight.description}</p>
                                </div>
                              </div>

                              {/* Watering Card */}
                              <div className="care-card watering-card">
                                <div className="care-card-icon">
                                  <span className="material-icons">{careInfo.watering.icon}</span>
                                </div>
                                <h4>Watering</h4>
                                <div className="care-card-content">
                                  <div className="care-value">{careInfo.watering.frequency}</div>
                                  <div className="care-detail">{careInfo.watering.amount}</div>
                                  <p className="care-description">{careInfo.watering.description}</p>
                                </div>
                              </div>

                              {/* Soil Card */}
                              <div className="care-card soil-card">
                                <div className="care-card-icon">
                                  <span className="material-icons">{careInfo.soil.icon}</span>
                                </div>
                                <h4>Soil & Pot</h4>
                                <div className="care-card-content">
                                  <div className="care-value">{careInfo.soil.type}</div>
                                  <div className="care-detail">pH: {careInfo.soil.ph}</div>
                                  <p className="care-description">{careInfo.soil.drainage}</p>
                                </div>
                              </div>

                              {/* Care Tips Card */}
                              <div className="care-card care-tips-card">
                                <div className="care-card-icon">
                                  <span className="material-icons">{careInfo.care.icon}</span>
                                </div>
                                <h4>Care Tips</h4>
                                <div className="care-card-content">
                                  <div className="care-value">{careInfo.care.temperature}</div>
                                  <div className="care-detail">Humidity: {careInfo.care.humidity}</div>
                                  <p className="care-description">{careInfo.care.tips}</p>
                                </div>
                              </div>
                            </div>

                            {/* Confidence Score Card - Full Width */}
                            <div className="confidence-score-card">
                              <div className="confidence-score-header">
                                <span className="material-icons">psychology</span>
                                <h4>AI Confidence Score</h4>
                              </div>
                              <div className="confidence-score-content">
                                <div className="confidence-circle">
                                  <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle
                                      cx="60"
                                      cy="60"
                                      r="54"
                                      fill="none"
                                      stroke="#e5e7eb"
                                      strokeWidth="12"
                                    />
                                    <circle
                                      cx="60"
                                      cy="60"
                                      r="54"
                                      fill="none"
                                      stroke={
                                        careInfo.confidence >= 80 ? '#10b981' :
                                          careInfo.confidence >= 50 ? '#f59e0b' : '#ef4444'
                                      }
                                      strokeWidth="12"
                                      strokeDasharray={`${(careInfo.confidence / 100) * 339.292} 339.292`}
                                      strokeLinecap="round"
                                      transform="rotate(-90 60 60)"
                                    />
                                    <text
                                      x="60"
                                      y="60"
                                      textAnchor="middle"
                                      dy="0.3em"
                                      fontSize="28"
                                      fontWeight="bold"
                                      fill={
                                        careInfo.confidence >= 80 ? '#10b981' :
                                          careInfo.confidence >= 50 ? '#f59e0b' : '#ef4444'
                                      }
                                    >
                                      {careInfo.confidence}%
                                    </text>
                                  </svg>
                                </div>
                                <div className="confidence-score-info">
                                  <h5>Match Quality: {
                                    careInfo.confidence >= 80 ? 'Excellent' :
                                      careInfo.confidence >= 50 ? 'Good' : 'Fair'
                                  }</h5>
                                  <p>
                                    {careInfo.confidence >= 80
                                      ? 'This identification has a very high confidence level. The plant characteristics strongly match our database.'
                                      : careInfo.confidence >= 50
                                        ? 'This identification has a good confidence level. The plant characteristics match well with our database.'
                                        : 'This identification has a fair confidence level. Consider taking a clearer photo for better results.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Camera Capture Overlay */}
      {showCamera && (
        <div className="camera-overlay">
          <div className="camera-container">
            <div className="camera-header">
              <h3>Take a Plant Photo</h3>
              <button className="close-camera" onClick={stopCamera}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="video-wrapper">
              <video ref={videoRef} autoPlay playsInline muted />
              <div className="camera-guide">
                <div className="guide-box"></div>
                <p>Fit the plant inside the box</p>
              </div>
            </div>
            <div className="camera-footer">
              <button className="capture-btn" onClick={capturePhoto}>
                <div className="capture-inner"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PlantIdentify;

































