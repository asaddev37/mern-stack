import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const ctaSection = document.querySelector('[data-cta-section]');
    if (ctaSection) observer.observe(ctaSection);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      data-cta-section
      className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -0.003}px, ${mousePosition.y * -0.003}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/8 rounded-full animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.002}px, ${mousePosition.y * 0.002}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white/20 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-3/4 right-1/3 w-4 h-4 bg-white/15 rounded-full animate-bounce delay-1000"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Mental Wellness?
            </span>
          </h2>
          
          <p className={`text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Join thousands of users who are already improving their mental health with MindSpace. 
            Start your journey today and discover the power of AI-guided wellness.
          </p>

          {/* Benefits Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {[
              { icon: '🚀', title: 'Start in Minutes', desc: 'Quick setup, immediate insights' },
              { icon: '🔒', title: '100% Private', desc: 'Your data is secure and confidential' },
              { icon: '📱', title: 'Always Available', desc: 'Access anywhere, anytime' }
            ].map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-blue-100 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Link to="/register">
              <button className="group px-12 py-6 bg-white text-blue-600 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Get Started Free
                  <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </Link>
            
            <button className="group px-12 py-6 border-2 border-white/30 text-white font-bold text-xl rounded-2xl backdrop-blur-sm hover:border-white/60 hover:bg-white/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500">
              <span className="flex items-center">
                <svg className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Demo
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-16 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-blue-200 text-sm mb-6">Trusted by users worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {[
                '🏆 Award Winning',
                '⭐ 4.9/5 Rating',
                '👥 10K+ Users',
                '🔒 SOC 2 Compliant'
              ].map((indicator, index) => (
                <div key={index} className="text-white/80 text-sm font-medium">
                  {indicator}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;