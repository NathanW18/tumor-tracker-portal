import React, { useState } from 'react';
import { auth } from '../firebase';
import { updatePassword } from 'firebase/auth';

export default function SettingsWorkspace({ userRole, userEmail }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword) return;

    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'Passwords do not match.', isError: true });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ text: 'Password must be at least 6 characters long.', isError: true });
      return;
    }

    setLoading(true);
    setStatusMessage({ text: '', isError: false });

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setStatusMessage({ text: 'Password updated successfully!', isError: false });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({ text: 'No active user session found. Please re-authenticate.', isError: true });
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setStatusMessage({ 
          text: 'Security sensitive operations require a recent sign-in. Please log out and back in to change your password.', 
          isError: true 
        });
      } else {
        setStatusMessage({ text: err.message, isError: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Account Settings
        </h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '13px' }}>
          Manage your platform profile credentials and review infrastructure permissions.
        </p>
      </div>

      {statusMessage.text && (
        <div style={{ 
          backgroundColor: statusMessage.isError ? '#fef2f2' : '#f0fdf4', 
          border: `1px solid ${statusMessage.isError ? '#fca5a5' : '#bbf7d0'}`, 
          color: statusMessage.isError ? '#b91c1c' : '#166534', 
          padding: '12px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', lineHeight: '1.4' 
        }}>
          {statusMessage.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SECTION 1: PROFILE SUMMARY */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 16px 0' }}>User Profile</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Email Address</span>
              <span style={{ color: '#0f172a', fontFamily: 'monospace' }}>{userEmail}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Assigned Group</span>
              <div>
                <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PASSWORD MUTATION FORM */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Security Configuration</h3>
          <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '12px' }}>Update your secret validation access passphrase key token.</p>
          
          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '320px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>New Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Confirm New Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 0', fontSize: '13px', fontWeight: '600', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s ease' }}
            >
              {loading ? 'Committing update...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}