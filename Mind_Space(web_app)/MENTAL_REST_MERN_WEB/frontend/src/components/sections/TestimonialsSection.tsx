import React, { useState, useEffect } from 'react';

const TestimonialsSection: React.FC = () => {
  const [visibleTestimonials, setVisibleTestimonials] = useState<number[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah M.',
      role: 'Student',
      content: 'MindSpace helped me understand my anxiety patterns. The AI insights are incredibly accurate and the journaling prompts are so helpful. I feel more in control of my mental health now.',
      initial: 'S',
      gradient: 'from-blue-500 to-purple-600',
      hoverColor: 'blue-600',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael R.',
      role: 'Professional',
      content: 'The mood tracking feature is amazing. I can see my progress over time and it motivates me to keep working on my mental health. The community support is incredible too.',
      initial: 'M',
      gradient: 'from-green-500 to-teal-600',
      hoverColor: 'green-600',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      id: 3,
      name: 'Alex K.',
      role: 'Parent',
      content: 'As a busy parent, MindSpace gives me the tools I need to prioritize my mental wellness. The guided exercises and progress tracking help me stay consistent.',
      initial: 'A',
      gradient: 'from-purple-500 to-pink-600',
      hoverColor: 'purple-600',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      id: 4,
      name: 'David L.',
      role: 'Entrepreneur',
      content: 'The AI insights have been game-changing for my stress management. I can now identify triggers and patterns I never noticed before. Highly recommended!',
      initial: 'D',
      gradient: 'from-orange-500 to-red-600',
      hoverColor: 'orange-600',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      id: 5,
      name: 'Emma W.',
      role: 'Therapist',
      content: 'I recommend MindSpace to my clients. The journaling features and mood tracking provide valuable insights that complement our therapy sessions perfectly.',
      initial: 'E',
      gradient: 'from-teal-500 to-cyan-600',
      hoverColor: 'teal-600',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5
    },
    {
      id: 6,
      name: 'James T.',
      role: 'Student',
      content: 'The community feature helped me connect with others going through similar challenges. It\'s amazing how much support and understanding you can find here.',
      initial: 'J',
      gradient: 'from-indigo-500 to-blue-600',
      hoverColor: 'indigo-600',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      rating: 5
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-testimonial-index') || '0');
            setTimeout(() => {
              setVisibleTestimonials(prev => [...prev, index]);
            }, index * 200);
          }
        });
      },
      { threshold: 0.1 }
    );

    const testimonialCards = document.querySelectorAll('[data-testimonial-index]');
    testimonialCards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6 animate-fade-in-up">
            What Our Users Say
          </h2>
          <p className="text-xl text-blue-100 animate-fade-in-up delay-200">
            Real stories from people who've transformed their mental wellness journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              data-testimonial-index={index}
              className={`group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-105 ${
                visibleTestimonials.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10 p-8">
                {/* Stars */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                {/* Quote */}
                <div className="mb-6">
                  <svg className="w-8 h-8 text-white/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                  <p className="text-white/90 italic text-lg leading-relaxed group-hover:text-white transition-colors duration-300">
                    "{testimonial.content}"
                  </p>
                </div>
                
                {/* User Info */}
                <div className="flex items-center">
                  <div className="relative">
                    <div className={`w-16 h-16 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {testimonial.initial}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-bold text-white group-hover:text-${testimonial.hoverColor} transition-colors duration-300`}>
                      {testimonial.name}
                    </h4>
                    <p className="text-blue-200 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Animated Border */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} 
                   style={{ padding: '2px' }}>
                <div className="w-full h-full bg-transparent rounded-3xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/80 text-lg mb-6">
            Join thousands of users who are already improving their mental wellness
          </p>
          <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500">
            <span className="flex items-center">
              Start Your Journey Today
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;