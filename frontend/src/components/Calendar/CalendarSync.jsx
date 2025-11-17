import React, { useState } from 'react';
import { calendarAPI } from '../../services/api';

const CalendarSync = () => {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async () => {
    try {
      const res = await calendarAPI.getAuthUrl();
      window.location.href = res.data.url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Failed to connect to Google Calendar');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await calendarAPI.sync();
      alert('Tasks synced to Google Calendar successfully!');
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('Failed to sync tasks. Make sure you are connected to Google Calendar.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await calendarAPI.disconnect();
      setConnected(false);
      alert('Disconnected from Google Calendar');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect');
    }
  };

  // Check if connected (you would check this from user profile)
  // For now, we'll show the connect button

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        📅 Google Calendar Sync
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sync your tasks and deadlines directly to your Google Calendar. This allows you to see
          your tasks alongside your other calendar events.
        </p>

        {!connected ? (
          <div>
            <button
              onClick={handleConnect}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Connect Google Calendar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg">
              <p className="text-green-700 dark:text-green-300">
                ✓ Connected to Google Calendar
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Tasks Now'}
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarSync;

