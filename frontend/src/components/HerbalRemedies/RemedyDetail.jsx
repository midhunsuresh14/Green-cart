import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';

const RemedyDetail = () => {
  const { remedyId } = useParams();
  const navigate = useNavigate();
  const [remedy, setRemedy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRemedy = async () => {
      try {
        setLoading(true);
        const data = await api.getRemedy(remedyId);
        setRemedy(data);
      } catch (err) {
        console.error('Error fetching remedy:', err);
        setError('Failed to load remedy details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (remedyId) {
      fetchRemedy();
    }
  }, [remedyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fdf8' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading remedy details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fdf8' }}>
        <div className="max-w-md text-center p-6 bg-white rounded-xl shadow-md">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/remedies')}
            className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            Back to Remedies
          </button>
        </div>
      </div>
    );
  }

  if (!remedy) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fdf8' }}>
        <div className="max-w-md text-center p-6 bg-white rounded-xl shadow-md">
          <div className="text-gray-400 mb-4">
            <Leaf className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Remedy Not Found</h2>
          <p className="text-gray-600 mb-6">The remedy you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/remedies')}
            className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            Back to Remedies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fdf8' }}>
      {/* Header */}
      <section className="px-6 py-8" style={{ backgroundColor: '#7fb069' }}>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/remedies')}
            className="flex items-center text-white mb-6 hover:opacity-80 transition-opacity"
          >
            <span className="mr-2">←</span> Back to Remedies
          </button>
          <div className="text-center text-white">
            <h1 className="text-4xl font-light mb-2">{remedy.name}</h1>
            <p className="text-xl opacity-90">For {remedy.illness}</p>
          </div>
        </div>
      </section>

      {/* Remedy Content */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="aspect-video overflow-hidden rounded-xl mb-6">
                  <img
                    src={remedy.imageUrl || 'https://via.placeholder.com/800x450?text=No+Image'}
                    alt={remedy.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {remedy.description || 'No description available for this remedy.'}
                </p>

                {remedy.benefits && remedy.benefits.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Benefits
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {remedy.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {remedy.preparation && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">How to Prepare</h3>
                    <div className="prose max-w-none text-gray-700">
                      <p className="whitespace-pre-line">{remedy.preparation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Remedy Information</h3>
                
                <div className="space-y-4">
                  {remedy.dosage && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Dosage</h4>
                      <p className="text-gray-700">{remedy.dosage}</p>
                    </div>
                  )}

                  {remedy.duration && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Duration</h4>
                        <p className="text-gray-700">{remedy.duration}</p>
                      </div>
                    </div>
                  )}

                  {remedy.effectiveness && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Effectiveness</h4>
                      <p className="text-gray-700">{remedy.effectiveness}</p>
                    </div>
                  )}

                  {remedy.precautions && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Precautions</h4>
                      <p className="text-gray-700">{remedy.precautions}</p>
                    </div>
                  )}

                  {remedy.keywords && remedy.keywords.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {remedy.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RemedyDetail;