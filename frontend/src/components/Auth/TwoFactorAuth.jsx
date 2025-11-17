import React, { useState } from 'react';
import { twoFactorAPI } from '../../services/api';

const TwoFactorAuth = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  // OTP state is commented out as it's not currently used
  // const [otp, setOtp] = useState('');

  const handleEnable = async () => {
    try {
      setLoading(true);
      const res = await twoFactorAPI.enable();
      setSecret(res.data.secret);
      setQrCode(res.data.otpauth);
      setEnabled(true);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      alert('Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      await twoFactorAPI.disable();
      setEnabled(false);
      setSecret('');
      setQrCode('');
      alert('2FA disabled successfully');
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      alert('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        🔐 Two-Factor Authentication
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {!enabled ? (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enable two-factor authentication to add an extra layer of security to your account.
            </p>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Enabling...' : 'Enable 2FA'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCode && (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300 inline-block mb-4">
                  <p className="text-xs text-gray-600 mb-2">Secret: {secret}</p>
                  <p className="text-xs text-gray-600 break-all">{qrCode}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;

