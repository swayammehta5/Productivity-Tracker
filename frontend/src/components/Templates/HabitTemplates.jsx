import React, { useState, useEffect } from 'react';
import { templatesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const HabitTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await templatesAPI.getAll();
      if (res.data && Array.isArray(res.data)) {
        setTemplates(res.data);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await templatesAPI.initialize();
      alert('Templates initialized successfully!');
      loadTemplates();
    } catch (error) {
      console.error('Failed to initialize templates:', error);
      alert('Failed to initialize templates');
    }
  };

  const handleApply = async (templateId) => {
    try {
      await templatesAPI.apply(templateId);
      alert('Template applied successfully!');
      navigate('/habits');
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🪄 Habit Templates
        </h1>
        {templates.length === 0 && (
          <button
            onClick={handleInitialize}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Initialize Templates
          </button>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No templates available. Click "Initialize Templates" to create default templates.
          </p>
          <button
            onClick={handleInitialize}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Initialize Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
          <div
            key={template._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {template.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {template.description}
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Includes {template.habits.length} habits:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {template.habits.slice(0, 3).map((habit, index) => (
                  <li key={index}>{habit.name}</li>
                ))}
                {template.habits.length > 3 && (
                  <li>... and {template.habits.length - 3} more</li>
                )}
              </ul>
            </div>
            <button
              onClick={() => handleApply(template._id)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Apply Template
            </button>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default HabitTemplates;

