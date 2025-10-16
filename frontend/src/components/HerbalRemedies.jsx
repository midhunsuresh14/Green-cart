import React, { useState, useEffect } from 'react';
import './HerbalRemedies.css';
import { api } from '../lib/api';

const HerbalRemedies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remedyCategories, setRemedyCategories] = useState([
    { id: 'all', name: 'All Remedies', icon: '🌿' }
  ]);

  // Load remedies and categories from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        
        // Load remedies
        const remediesData = await api.listRemedies();
        setRemedies(Array.isArray(remediesData) ? remediesData : getDefaultRemedies());
        
        // Load categories
        try {
          const categoriesData = await api.listRemedyCategories();
          const allCategory = { id: 'all', name: 'All Remedies', icon: '🌿' };
          const dynamicCategories = Array.isArray(categoriesData) ? categoriesData.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '🌿'
          })) : [];
          setRemedyCategories([allCategory, ...dynamicCategories]);
        } catch (e) {
          console.log('Using default categories:', e.message);
          // Fallback to default categories
          setRemedyCategories([
            { id: 'all', name: 'All Remedies', icon: '🌿' },
            { id: 'digestive', name: 'Digestive Health', icon: '🫀' },
            { id: 'respiratory', name: 'Respiratory', icon: '🫁' },
            { id: 'immune', name: 'Immune System', icon: '💪' },
            { id: 'skin', name: 'Skin Care', icon: '✨' },
            { id: 'stress', name: 'Stress & Sleep', icon: '😌' },
            { id: 'pain', name: 'Pain Relief', icon: '🤕' },
            { id: 'cardiovascular', name: 'Heart Health', icon: '❤️' },
            { id: 'mental', name: 'Mental Health', icon: '🧠' }
          ]);
        }
      } catch (e) {
        console.log('Using default remedies:', e.message);
        setError('Unable to load remedies from server. Showing sample data.');
        setRemedies(getDefaultRemedies());
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fallback default remedies if API fails
  function getDefaultRemedies() {
    return [
      {
        id: 'r1',
        name: 'Ginger Tea',
        category: 'digestive',
        illness: 'Nausea & Indigestion',
        keywords: ['nausea', 'indigestion', 'stomach upset', 'morning sickness', 'motion sickness'],
        imageUrl: '/uploads/20250918164353826388.jpg',
        description: 'Fresh ginger root tea to soothe stomach discomfort and reduce nausea.',
        benefits: ['Reduces nausea', 'Aids digestion', 'Anti-inflammatory', 'Relieves motion sickness'],
        preparation: 'Boil 1 inch fresh ginger in 2 cups water for 10 minutes. Strain and drink warm.',
        dosage: '2-3 cups daily as needed',
        duration: 'Until symptoms subside',
        precautions: 'Avoid if you have bleeding disorders or are taking blood thinners',
        tags: ['Digestive', 'Anti-nausea', 'Natural'],
        effectiveness: 'High - Works within 30 minutes'
      },
      {
        id: 'r2',
        name: 'Chamomile Tea',
        category: 'stress',
        illness: 'Anxiety & Insomnia',
        keywords: ['anxiety', 'insomnia', 'sleep', 'stress', 'relaxation'],
        imageUrl: '/uploads/default-remedy.jpg',
        description: 'Calming chamomile tea to reduce anxiety and promote restful sleep.',
        benefits: ['Reduces anxiety', 'Promotes sleep', 'Calming effect', 'Natural relaxant'],
        preparation: 'Steep 1 tea bag in hot water for 5-7 minutes. Drink before bedtime.',
        dosage: '1-2 cups daily, especially before bed',
        duration: 'Use as needed for sleep support',
        precautions: 'May cause allergic reactions in people allergic to ragweed family',
        tags: ['Stress Relief', 'Sleep Aid', 'Calming'],
        effectiveness: 'Medium - Noticeable relaxation within 30-60 minutes'
      }
    ];
  }

  const filteredRemedies = remedies.filter(remedy => {
    const matchesCategory = selectedCategory === 'all' || remedy.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      remedy.illness.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remedy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (remedy.keywords && Array.isArray(remedy.keywords) && remedy.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  const handleViewDetails = (remedy) => {
    setSelectedRemedy(remedy);
  };

  const handleCloseDetails = () => {
    setSelectedRemedy(null);
  };

  return (
    <div className="herbal-remedies">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}
      
      <div className="remedies-header">
        <h1>Herbal Remedies</h1>
        <p>Search for natural treatments for common ailments and get detailed cure information</p>
        
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for illness, symptoms, or remedies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="remedies-categories">
        {remedyCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading remedies...</p>
        </div>
      ) : (
        <>
          <div className="remedies-grid">
            {filteredRemedies.map(remedy => (
              <div key={remedy.id} className="remedy-card">
                <div className="remedy-image-container">
                  <img 
                    src={remedy.imageUrl || remedy.image || '/uploads/default-remedy.jpg'} 
                    alt={remedy.name}
                    className="remedy-image"
                    onError={(e) => {
                      e.target.src = '/uploads/default-remedy.jpg';
                    }}
                  />
                  <div className="remedy-tag">{remedy.illness}</div>
                </div>

                <div className="remedy-content">
                  <h3 className="remedy-name">{remedy.name}</h3>
                  <p className="remedy-description">{remedy.description}</p>

                  <div className="remedy-benefits">
                    {(remedy.benefits || []).slice(0, 3).map((benefit, index) => (
                      <span key={index} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>

                  <div className="remedy-effectiveness">
                    <strong>Effectiveness:</strong>
                    <span className="effectiveness-value">{remedy.effectiveness}</span>
                  </div>

                  <div className="remedy-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(remedy)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRemedies.length === 0 && !loading && (
            <div className="no-remedies">
              <p>No remedies found for "{searchTerm}". Try searching for different symptoms or browse by category.</p>
            </div>
          )}
        </>
      )}

      {/* Detailed Remedy Modal */}
      {selectedRemedy && (
        <div className="remedy-modal-overlay" onClick={handleCloseDetails}>
          <div className="remedy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRemedy.name}</h2>
              <button className="close-btn" onClick={handleCloseDetails}>×</button>
            </div>

            <div className="modal-content">
              <div className="remedy-image-section">
                <img 
                  src={selectedRemedy.imageUrl || selectedRemedy.image || '/uploads/default-remedy.jpg'} 
                  alt={selectedRemedy.name}
                  className="modal-remedy-image"
                  onError={(e) => {
                    e.target.src = '/uploads/default-remedy.jpg';
                  }}
                />
              </div>

              <div className="remedy-details">
                <div className="illness-section">
                  <h3>For: {selectedRemedy.illness}</h3>
                  <p className="description">{selectedRemedy.description}</p>
                </div>

                <div className="benefits-section">
                  <h4>Benefits:</h4>
                  <ul className="benefits-list">
                    {(selectedRemedy.benefits || []).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="preparation-section">
                  <h4>Preparation:</h4>
                  <p className="preparation">{selectedRemedy.preparation}</p>
                </div>

                <div className="usage-info">
                  <p><strong>Dosage:</strong> {selectedRemedy.dosage}</p>
                  <p><strong>Duration:</strong> {selectedRemedy.duration}</p>
                  <p><strong>Effectiveness:</strong> {selectedRemedy.effectiveness}</p>
                </div>

                <div className="precautions-section">
                  <h4>Precautions:</h4>
                  <p className="precautions">{selectedRemedy.precautions}</p>
                </div>

                <div className="tags-section">
                  <h4>Tags:</h4>
                  <div className="tags-container">
                    {(selectedRemedy.keywords || selectedRemedy.tags || []).map((keyword, index) => (
                      <span key={index} className="tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HerbalRemedies;