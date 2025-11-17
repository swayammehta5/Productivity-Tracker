import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';

const SmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await aiAPI.getSuggestions();
      if (res.data && res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      } else if (Array.isArray(res.data)) {
        setSuggestions(res.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      // Set empty suggestions on error - this is fine, fallback will work
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading suggestions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        💡 Smart Suggestions
      </h2>
      {suggestions.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No suggestions available at the moment.</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {suggestion.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      suggestion.type === 'new_habit' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {suggestion.type === 'new_habit' ? 'New Habit' : 'Improvement'}
                    </span>
                  </div>
                  {suggestion.reason && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💭 {suggestion.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;

