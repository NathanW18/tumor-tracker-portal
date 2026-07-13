import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginGate({ onLoginSuccess }) {
  // Toggle between 'login' and 'register' modes
  const [authMode, setAuthMode] = useState('login'); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    // Validation check for registration mode
    if (authMode === 'register' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let userCredential;

      if (authMode === 'login') {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        // Register a new user account in Firebase
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      }

      const user = userCredential.user;

      // Assign user groups context based on corporate email coordinates
      let resolvedGroup = 'RESEARCHER';
      if (email.toLowerCase().includes('admin') || email.toLowerCase().endsWith('@uhn.ca')) {
        resolvedGroup = 'ADMIN';
      }

      onLoginSuccess(resolvedGroup, user.email);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password must be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password credentials.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '32px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        
        {/* Brand Signpost */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#38bdf8', width: '10px', height: '10px', borderRadius: '2px' }} />
          <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px', letterSpacing: '0.02em' }}>PM Data Science</div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0', textAlign: 'center' }}>
          {authMode === 'login' ? 'Sign in with Firebase' : 'Create an account'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', textAlign: 'center' }}>
          {authMode === 'login' ? 'Provide authorized infrastructure credentials' : 'Register your terminal profile access keys'}
        </p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '16px', lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Email address</label>
            <input 
              type="email" 
              required
              placeholder="operator@uhnresearch.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Confirm Password (Only visible in Register mode) */}
          {authMode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Confirm Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#0f172a', color: '#ffffff', padding: '10px 0', fontSize: '13px', fontWeight: '600', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          >
            {loading ? 'Processing auth signature...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Auth Mode Toggle Link Options */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          {authMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: '600', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                Create one here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: '600', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                Sign in instead
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}