import React from 'react';
import Card from '../components/common/Card';

const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          This page will allow users to manage their profile, preferences, and account settings.
        </p>
      </Card>
    </div>
  );
};

export default Profile;
