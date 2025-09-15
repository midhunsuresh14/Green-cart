import React from 'react';

const About = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"leaves\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"20\" cy=\"20\" r=\"2\" fill=\"%2310b981\" opacity=\"0.1\"/><circle cx=\"80\" cy=\"80\" r=\"1.5\" fill=\"%2314b8a6\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"30\" r=\"1\" fill=\"%2334d399\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23leaves)\"/></svg>')] opacity-30"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-green-600">GreenCart</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Your trusted partner in bringing nature's healing power to your doorstep
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover-lift animate-fade-in-left">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 hover-scale">
                <span className="material-icons text-3xl text-green-600">eco</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To make medicinal plants and herbs accessible to everyone, promoting natural healing and sustainable living through quality products and expert guidance.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover-lift animate-fade-in-left" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 hover-scale">
                <span className="material-icons text-3xl text-green-600">verified</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Assurance</h3>
              <p className="text-gray-600 leading-relaxed">
                Every plant is carefully selected, grown with organic methods, and tested for purity to ensure you receive the highest quality medicinal herbs.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover-lift animate-fade-in-right">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 hover-scale">
                <span className="material-icons text-3xl text-green-600">local_florist</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Knowledge</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team of herbalists and botanists provides detailed information about each plant's medicinal properties and proper usage.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover-lift animate-fade-in-right" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 hover-scale">
                <span className="material-icons text-3xl text-green-600">favorite</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Care</h3>
              <p className="text-gray-600 leading-relaxed">
                We're committed to your success with personalized care instructions, growing tips, and ongoing support for your plant journey.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center animate-scale-in" style={{animationDelay: '0.1s'}}>
            <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">500+</div>
            <div className="text-gray-600">Plant Varieties</div>
          </div>
          <div className="text-center animate-scale-in" style={{animationDelay: '0.2s'}}>
            <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">10K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center animate-scale-in" style={{animationDelay: '0.3s'}}>
            <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">5+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="text-center animate-scale-in" style={{animationDelay: '0.4s'}}>
            <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">100%</div>
            <div className="text-gray-600">Organic</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
