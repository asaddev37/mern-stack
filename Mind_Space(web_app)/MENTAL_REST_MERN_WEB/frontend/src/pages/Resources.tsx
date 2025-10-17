import React from 'react';
import Card from '../components/common/Card';

const Resources: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Wellness Resources
        </h1>
        <p className="text-gray-600">
          This page will display journal prompts, mindfulness exercises, and wellness goals.
        </p>
      </Card>
    </div>
  );
};

export default Resources;
