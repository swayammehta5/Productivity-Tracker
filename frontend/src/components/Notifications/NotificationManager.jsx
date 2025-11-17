import React, { useState, useEffect } from 'react';
// authAPI import removed as it's not being used

const NotificationManager = () => {
  const [permission, setPermission] = useState('default');
  const [, setEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkNotificationSupport();
    }
  }, []);

  const checkNotificationSupport = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setEnabled(true);
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setEnabled(true);
        showTestNotification();
      }
    } else {
      alert('Browser notifications are not supported in your browser.');
    }
  };

  const showTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Notifications Enabled', {
        body: 'You will now receive reminders for your habits and tasks!',
        icon: '/logo192.png'
      });
    }
  };

  // scheduleReminder function removed as it was unused

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🔔 Smart Notifications & Reminders
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Browser Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enable browser notifications to receive reminders for your habits and tasks.
          </p>
          
          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Enable Notifications
            </button>
          )}

          {permission === 'granted' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg">
              <p className="text-green-700 dark:text-green-300">
                ✓ Notifications are enabled. You will receive reminders for your habits and tasks.
              </p>
            </div>
          )}

          {permission === 'denied' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-700 dark:text-red-300">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Reminder Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can set custom reminder times for each habit and task when creating or editing them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;

