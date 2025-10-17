import React from 'react';
import Card from '../components/common/Card';

const Insights: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Insights & Analytics
        </h1>
        <p className="text-gray-600">
          This page will display AI-powered insights, mood trends, and analytics.
        </p>
      </Card>
    </div>
  );
};

export default Insights;
