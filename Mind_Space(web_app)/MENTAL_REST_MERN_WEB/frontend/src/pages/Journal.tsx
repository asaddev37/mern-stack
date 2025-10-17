import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { journalService } from '../services/journalService';
import { JournalEntry } from '../types';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEntries();
  }, [currentPage]);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const response = await journalService.getEntries({
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setEntries(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEntries();
      return;
    }

    try {
      setIsLoading(true);
      const response = await journalService.searchEntries(searchQuery);
      setEntries(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to search entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      'very-happy': '😄',
      'happy': '😊',
      'neutral': '😐',
      'sad': '😢',
      'very-sad': '😭',
      'anxious': '😰',
      'stressed': '😓',
      'calm': '😌',
      'excited': '🤩',
      'grateful': '🙏',
      'frustrated': '😤',
      'peaceful': '☮️'
    };
    return moodEmojis[mood] || '😐';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
          <p className="text-gray-600">Your personal thoughts and reflections</p>
        </div>
        <Link to="/app/journal/new">
          <Button className="mt-4 sm:mt-0">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search your entries..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <Button onClick={handleSearch}>
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Entries List */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry._id} hover>
              <div className="flex items-start space-x-4">
                <div className="text-3xl">
                  {getMoodEmoji(entry.mood)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entry.title || 'Untitled Entry'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {entry.isFavorite && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-3">
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{entry.wordCount} words</span>
                      <span>{entry.readingTime} min read</span>
                    </div>
                    <Link to={`/app/journal/${entry._id}`}>
                      <Button variant="ghost" size="sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No entries yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your journaling journey by creating your first entry.
            </p>
            <Link to="/app/journal/new">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Entry
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex space-x-2">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Journal;
