import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home: React.FC = () => {
  const features = [
    {
      icon: BookOpenIcon,
      title: 'Personal Journaling',
      description: 'Express your thoughts and emotions through guided journaling prompts and free-form writing.',
    },
    {
      icon: ChartBarIcon,
      title: 'Mood Tracking',
      description: 'Track your emotional patterns and gain insights into your mental wellness journey.',
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Insights',
      description: 'Get personalized insights and wellness tips powered by advanced AI analysis.',
    },
    {
      icon: HeartIcon,
      title: 'Wellness Goals',
      description: 'Set and track personal wellness goals to build healthy habits and routines.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">MindSpace</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Mental Wellness
              <span className="text-blue-600"> Journey</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Track your emotions, reflect on your thoughts, and build healthier habits with 
              AI-powered insights designed to support your mental wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for mental wellness
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines journaling, mood tracking, and AI insights 
              to help you understand and improve your mental health.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your wellness journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already improving their mental health 
            with MindSpace.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <HeartIcon className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-xl font-bold">MindSpace</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your personal mental wellness companion
            </p>
            <p className="text-sm text-gray-500">
              © 2024 MindSpace. Built with ❤️ for mental wellness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
