import React, { useState } from 'react';
import './HerbalRemedies.css';

const HerbalRemedies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRemedy, setSelectedRemedy] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const remedyCategories = [
    { id: 'all', name: 'All Remedies', icon: '🌿' },
    { id: 'digestive', name: 'Digestive Health', icon: '🫀' },
    { id: 'respiratory', name: 'Respiratory', icon: '🫁' },
    { id: 'immune', name: 'Immune System', icon: '💪' },
    { id: 'skin', name: 'Skin Care', icon: '✨' },
    { id: 'stress', name: 'Stress & Sleep', icon: '😌' },
    { id: 'pain', name: 'Pain Relief', icon: '🤕' }
  ];

  const remedies = [
    // Digestive Health
    {
      id: 'r1',
      name: 'Ginger Tea',
      category: 'digestive',
      illness: 'Nausea & Indigestion',
      keywords: ['nausea', 'indigestion', 'stomach upset', 'morning sickness', 'motion sickness'],
      image: '/uploads/20250918164353826388.jpg',
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
      name: 'Peppermint Oil',
      category: 'digestive',
      illness: 'IBS & Bloating',
      keywords: ['ibs', 'irritable bowel', 'bloating', 'stomach cramps', 'digestive issues'],
      image: '/uploads/20250918164539716225.jpg',
      description: 'Pure peppermint oil for irritable bowel syndrome relief and digestive comfort.',
      benefits: ['Relieves IBS symptoms', 'Reduces bloating', 'Calms stomach muscles', 'Reduces gas'],
      preparation: 'Take 1-2 peppermint oil capsules 30 minutes before meals with water.',
      dosage: '1-2 capsules, 3 times daily before meals',
      duration: '2-4 weeks for full effect',
      precautions: 'May cause heartburn in some people. Do not use if you have GERD.',
      tags: ['Digestive', 'IBS Relief', 'Bloating'],
      effectiveness: 'High - Noticeable improvement within 1-2 weeks'
    },
    {
      id: 'r3',
      name: 'Chamomile Tea',
      category: 'digestive',
      illness: 'Stomach Cramps',
      keywords: ['stomach cramps', 'abdominal pain', 'digestive spasms', 'stomach ache'],
      image: '/uploads/20250918164742265732.jpg',
      description: 'Gentle chamomile tea to calm stomach cramps and promote relaxation.',
      benefits: ['Soothes stomach cramps', 'Promotes relaxation', 'Anti-spasmodic', 'Reduces inflammation'],
      preparation: 'Steep 1 tea bag in hot water for 5-7 minutes. Drink warm.',
      dosage: '2-3 cups daily',
      duration: 'Until cramps subside',
      precautions: 'May cause allergic reactions in people allergic to ragweed family',
      tags: ['Digestive', 'Calming', 'Anti-spasmodic'],
      effectiveness: 'Medium - Relief within 30-60 minutes'
    },

    // Respiratory Health
    {
      id: 'r4',
      name: 'Eucalyptus Steam Treatment',
      category: 'respiratory',
      illness: 'Cough & Congestion',
      keywords: ['cough', 'congestion', 'cold', 'respiratory', 'steam', 'breathing'],
      image: '/uploads/20250918164852756162.jpg',
      description: 'Eucalyptus essential oil for steam inhalation to clear respiratory passages.',
      benefits: ['Clears congestion', 'Relieves cough', 'Opens airways', 'Reduces inflammation'],
      preparation: 'Add 5-10 drops to hot water, cover head with towel, and inhale steam for 10 minutes.',
      dosage: '2-3 times daily',
      duration: '3-5 days or until symptoms improve',
      precautions: 'Avoid if you have asthma. Do not use on children under 6 years old.',
      tags: ['Respiratory', 'Decongestant', 'Steam Treatment'],
      effectiveness: 'High - Immediate relief from congestion'
    },
    {
      id: 'r5',
      name: 'Thyme & Honey Syrup',
      category: 'respiratory',
      illness: 'Sore Throat',
      keywords: ['sore throat', 'throat pain', 'cough', 'thyme', 'honey', 'antibacterial'],
      image: '/uploads/20250918165107091330.jpg',
      description: 'Natural throat syrup with thyme and raw honey for sore throat relief.',
      benefits: ['Soothes sore throat', 'Antibacterial', 'Natural cough suppressant', 'Reduces inflammation'],
      preparation: 'Take 1-2 teaspoons every 2-3 hours as needed.',
      dosage: '1-2 teaspoons every 2-3 hours',
      duration: 'Until throat pain subsides',
      precautions: 'Not suitable for children under 1 year due to honey content.',
      tags: ['Respiratory', 'Sore Throat', 'Antibacterial'],
      effectiveness: 'High - Relief within 15-30 minutes'
    },
    {
      id: 'r6',
      name: 'Mullein Leaf Tea',
      category: 'respiratory',
      illness: 'Bronchitis',
      keywords: ['bronchitis', 'cough', 'respiratory infection', 'lung', 'mullein'],
      image: '/uploads/20250918165418219540.jpg',
      description: 'Mullein leaf tea to help with bronchitis and respiratory inflammation.',
      benefits: ['Reduces inflammation', 'Expectorant', 'Soothes bronchial tubes', 'Natural cough relief'],
      preparation: 'Steep 1-2 teaspoons dried mullein in hot water for 10 minutes. Strain well.',
      dosage: '2-3 cups daily',
      duration: '1-2 weeks or until symptoms improve',
      precautions: 'Strain well to avoid irritating hairs. Not recommended for pregnant women.',
      tags: ['Respiratory', 'Bronchitis', 'Anti-inflammatory'],
      effectiveness: 'Medium - Improvement within 3-5 days'
    },

    // Immune System
    {
      id: 'r7',
      name: 'Elderberry Syrup',
      category: 'immune',
      illness: 'Cold & Flu Prevention',
      keywords: ['cold', 'flu', 'immunity', 'elderberry', 'antiviral', 'prevention'],
      image: '/uploads/20250918165611801624.jpg',
      description: 'Powerful elderberry syrup to boost immunity and fight cold and flu viruses.',
      benefits: ['Boosts immunity', 'Antiviral properties', 'Reduces flu duration', 'Prevents infections'],
      preparation: 'Take 1 tablespoon daily during cold season or at first sign of illness.',
      dosage: '1 tablespoon daily for prevention, 2-3 times daily when sick',
      duration: 'Daily during cold season',
      precautions: 'Not recommended for pregnant women or those with autoimmune conditions.',
      tags: ['Immune', 'Antiviral', 'Cold Prevention'],
      effectiveness: 'High - Reduces cold duration by 2-4 days'
    },
    {
      id: 'r8',
      name: 'Astragalus Root Powder',
      category: 'immune',
      illness: 'Low Immunity',
      keywords: ['immunity', 'energy', 'astragalus', 'immune system', 'weakness', 'fatigue'],
      image: '/uploads/20250918165743099761.jpg',
      description: 'Traditional Chinese herb to strengthen immune system and increase energy.',
      benefits: ['Strengthens immunity', 'Increases energy', 'Adaptogenic', 'Reduces fatigue'],
      preparation: 'Mix 1 teaspoon in warm water or smoothie daily.',
      dosage: '1 teaspoon daily',
      duration: '4-6 weeks for full effect',
      precautions: 'May interact with immunosuppressive drugs. Consult doctor if taking medications.',
      tags: ['Immune', 'Energy', 'Adaptogenic'],
      effectiveness: 'Medium - Noticeable improvement within 2-3 weeks'
    },
    {
      id: 'r9',
      name: 'Turmeric & Black Pepper',
      category: 'immune',
      illness: 'Inflammation',
      keywords: ['inflammation', 'turmeric', 'curcumin', 'joint pain', 'swelling', 'antioxidant'],
      image: '/uploads/20250918165849056483.jpg',
      description: 'Curcumin with black pepper for enhanced absorption and anti-inflammatory benefits.',
      benefits: ['Anti-inflammatory', 'Antioxidant', 'Immune support', 'Reduces joint pain'],
      preparation: 'Take 2 capsules daily with meals for best absorption.',
      dosage: '2 capsules daily with meals',
      duration: '4-8 weeks for full effect',
      precautions: 'May increase bleeding risk. Avoid if taking blood thinners.',
      tags: ['Immune', 'Anti-inflammatory', 'Antioxidant'],
      effectiveness: 'High - Noticeable reduction in inflammation within 2-3 weeks'
    },

    // Skin Care
    {
      id: 'r10',
      name: 'Aloe Vera Gel',
      category: 'skin',
      illness: 'Sunburn & Skin Irritation',
      keywords: ['sunburn', 'skin irritation', 'aloe vera', 'healing', 'moisturizer', 'burns'],
      image: '/uploads/20250918171009190631.jpg',
      description: 'Pure aloe vera gel for sunburn relief and skin healing.',
      benefits: ['Soothes sunburn', 'Heals skin', 'Moisturizes', 'Reduces inflammation'],
      preparation: 'Apply directly to affected area 2-3 times daily.',
      dosage: 'Apply as needed',
      duration: 'Until skin heals completely',
      precautions: 'Test on small area first. Avoid if allergic to aloe.',
      tags: ['Skin Care', 'Sunburn Relief', 'Healing'],
      effectiveness: 'High - Immediate cooling and relief'
    },
    {
      id: 'r11',
      name: 'Tea Tree Oil Cream',
      category: 'skin',
      illness: 'Acne & Skin Infections',
      keywords: ['acne', 'skin infection', 'tea tree oil', 'antibacterial', 'pimples', 'bacteria'],
      image: '/uploads/20250918171259327143.jpg',
      description: 'Tea tree oil cream for acne treatment and skin infection prevention.',
      benefits: ['Treats acne', 'Antibacterial', 'Prevents infections', 'Reduces inflammation'],
      preparation: 'Apply thin layer to affected area 1-2 times daily.',
      dosage: '1-2 times daily',
      duration: '2-4 weeks for acne improvement',
      precautions: 'May cause skin irritation. Dilute if sensitive skin. Avoid eye area.',
      tags: ['Skin Care', 'Acne Treatment', 'Antibacterial'],
      effectiveness: 'High - Visible improvement within 1-2 weeks'
    },
    {
      id: 'r12',
      name: 'Calendula Salve',
      category: 'skin',
      illness: 'Eczema & Dry Skin',
      keywords: ['eczema', 'dry skin', 'calendula', 'skin irritation', 'moisturizer', 'dermatitis'],
      image: '/uploads/20250918171516431940.jpg',
      description: 'Calendula salve for eczema relief and dry skin treatment.',
      benefits: ['Soothes eczema', 'Moisturizes dry skin', 'Anti-inflammatory', 'Heals cracked skin'],
      preparation: 'Apply to affected areas 2-3 times daily.',
      dosage: '2-3 times daily',
      duration: '2-4 weeks for improvement',
      precautions: 'Test on small area first. Discontinue if irritation occurs.',
      tags: ['Skin Care', 'Eczema Relief', 'Moisturizing'],
      effectiveness: 'High - Relief within 3-5 days'
    },

    // Stress & Sleep
    {
      id: 'r13',
      name: 'Lavender Essential Oil',
      category: 'stress',
      illness: 'Anxiety & Insomnia',
      keywords: ['anxiety', 'insomnia', 'sleep', 'lavender', 'relaxation', 'stress'],
      image: '/uploads/20250918171735648095.jpg',
      description: 'Pure lavender essential oil for relaxation and better sleep.',
      benefits: ['Reduces anxiety', 'Promotes sleep', 'Calming', 'Reduces stress'],
      preparation: 'Diffuse 3-5 drops or apply diluted to temples and wrists.',
      dosage: '3-5 drops for diffusion, diluted for topical use',
      duration: 'Use as needed',
      precautions: 'Dilute before topical use. Avoid during pregnancy. May cause drowsiness.',
      tags: ['Stress Relief', 'Sleep Aid', 'Calming'],
      effectiveness: 'High - Immediate calming effect'
    },
    {
      id: 'r14',
      name: 'Valerian Root Capsules',
      category: 'stress',
      illness: 'Sleep Disorders',
      keywords: ['sleep disorders', 'insomnia', 'valerian', 'sleep aid', 'restlessness', 'sleep quality'],
      image: '/uploads/20250918171935245477.jpg',
      description: 'Valerian root capsules for natural sleep support and relaxation.',
      benefits: ['Improves sleep quality', 'Reduces sleep latency', 'Natural sedative', 'Reduces restlessness'],
      preparation: 'Take 1-2 capsules 30 minutes before bedtime.',
      dosage: '1-2 capsules 30 minutes before bed',
      duration: '2-4 weeks for full effect',
      precautions: 'May cause drowsiness. Do not drive after taking. Avoid with alcohol.',
      tags: ['Sleep Aid', 'Natural Sedative', 'Relaxation'],
      effectiveness: 'High - Improved sleep within 1-2 weeks'
    },
    {
      id: 'r15',
      name: 'Ashwagandha Powder',
      category: 'stress',
      illness: 'Chronic Stress',
      keywords: ['chronic stress', 'anxiety', 'ashwagandha', 'adaptogen', 'stress management', 'cortisol'],
      image: '/uploads/20250918172345126148.jpg',
      description: 'Adaptogenic ashwagandha powder to combat stress and improve resilience.',
      benefits: ['Reduces stress', 'Adaptogenic', 'Improves resilience', 'Lowers cortisol'],
      preparation: 'Mix 1 teaspoon in warm milk or water before bed.',
      dosage: '1 teaspoon daily',
      duration: '4-8 weeks for full effect',
      precautions: 'May interact with thyroid medications. Avoid during pregnancy.',
      tags: ['Stress Relief', 'Adaptogenic', 'Resilience'],
      effectiveness: 'Medium - Noticeable stress reduction within 2-3 weeks'
    },

    // Pain Relief
    {
      id: 'r16',
      name: 'Arnica Gel',
      category: 'pain',
      illness: 'Muscle Pain & Bruises',
      keywords: ['muscle pain', 'bruises', 'arnica', 'pain relief', 'swelling', 'inflammation'],
      image: '/uploads/20250918172533843891.jpg',
      description: 'Arnica gel for muscle pain relief and bruise healing.',
      benefits: ['Relieves muscle pain', 'Heals bruises', 'Anti-inflammatory', 'Reduces swelling'],
      preparation: 'Apply to affected area 2-3 times daily, avoiding broken skin.',
      dosage: '2-3 times daily',
      duration: 'Until pain and bruising subsides',
      precautions: 'Do not apply to broken skin. Avoid if allergic to ragweed family.',
      tags: ['Pain Relief', 'Muscle Pain', 'Bruise Healing'],
      effectiveness: 'High - Pain relief within 30 minutes to 2 hours'
    }
  ];

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

      <div className="remedies-grid">
        {filteredRemedies.map(remedy => (
          <div key={remedy.id} className="remedy-card">
            <div className="remedy-image-container">
              <img 
                src={remedy.image} 
                alt={remedy.name}
                className="remedy-image"
                onError={(e) => {
                  e.target.src = '/snake plant.avif'; // Fallback image
                }}
              />
              <div className="remedy-tag">{remedy.illness}</div>
            </div>
            
            <div className="remedy-content">
              <h3 className="remedy-name">{remedy.name}</h3>
              <p className="remedy-description">{remedy.description}</p>
              
              <div className="remedy-benefits">
                {remedy.benefits.slice(0, 3).map((benefit, index) => (
                  <span key={index} className="benefit-tag">{benefit}</span>
                ))}
              </div>

              <div className="remedy-effectiveness">
                <span className="effectiveness-label">Effectiveness:</span>
                <span className="effectiveness-value">{remedy.effectiveness}</span>
              </div>

              <div className="remedy-actions">
                <button 
                  className="btn-primary"
                  onClick={() => handleViewDetails(remedy)}
                >
                  View Cure Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRemedies.length === 0 && (
        <div className="no-remedies">
          <p>No remedies found for "{searchTerm}". Try searching for different symptoms or browse by category.</p>
        </div>
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
              <div className="modal-image">
                <img 
                  src={selectedRemedy.image} 
                  alt={selectedRemedy.name}
                  onError={(e) => {
                    e.target.src = '/snake plant.avif';
                  }}
                />
              </div>
              
              <div className="modal-details">
                <div className="detail-section">
                  <h3>For: {selectedRemedy.illness}</h3>
                  <p className="description">{selectedRemedy.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Health Benefits</h4>
                  <ul className="benefits-list">
                    {selectedRemedy.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>How to Prepare</h4>
                  <p className="preparation">{selectedRemedy.preparation}</p>
                </div>

                <div className="detail-section">
                  <h4>Dosage & Duration</h4>
                  <p><strong>Dosage:</strong> {selectedRemedy.dosage}</p>
                  <p><strong>Duration:</strong> {selectedRemedy.duration}</p>
                  <p><strong>Effectiveness:</strong> {selectedRemedy.effectiveness}</p>
                </div>

                <div className="detail-section">
                  <h4>Precautions</h4>
                  <p className="precautions">{selectedRemedy.precautions}</p>
                </div>

                <div className="detail-section">
                  <h4>Keywords</h4>
                  <div className="keywords">
                    {selectedRemedy.keywords.map((keyword, index) => (
                      <span key={index} className="keyword-tag">{keyword}</span>
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
