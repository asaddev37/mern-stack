import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';

const JournalEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Journal Entry {id}
        </h1>
        <p className="text-gray-600">
          This page will display the full journal entry with editing capabilities.
        </p>
      </Card>
    </div>
  );
};

export default JournalEntry;
