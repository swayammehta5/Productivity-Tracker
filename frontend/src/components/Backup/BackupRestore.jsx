import React, { useState } from 'react';
import { backupAPI } from '../../services/api';

const BackupRestore = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await backupAPI.export();
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);
      await backupAPI.import(data);
      alert('Data imported successfully! Please refresh the page.');
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        📦 Data Backup & Restore
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Export Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Download all your habits, tasks, and mood data as a JSON file.
          </p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Import */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Import Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload a backup file to restore your data.
          </p>
          <label className="block w-full">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
            <div className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-center cursor-pointer disabled:opacity-50">
              {loading ? 'Importing...' : 'Import Data'}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;

