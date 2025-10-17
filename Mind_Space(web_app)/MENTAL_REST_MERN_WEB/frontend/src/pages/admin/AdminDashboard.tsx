import React from 'react';
import Card from '../../components/common/Card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          This page will provide admin tools for content moderation, analytics, and user management.
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
