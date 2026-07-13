import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import LoginGate from './components/LoginGate';
import DashboardOverview from './components/DashboardOverview';
import StudiesManagement from './components/StudiesManagement';
import ModelsRegistry from './components/ModelsRegistry';
import BioSamplesRegistry from './components/BioSamplesRegistry';
import SettingsWorkspace from './components/SettingsWorkspace';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');
  const [loggedInUserGroup, setLoggedInUserGroup] = useState('');
  const [appInitializing, setAppInitializing] = useState(true);

  const [currentTab, setCurrentTab] = useState('overview'); 
  const [studySearchTarget, setStudySearchTarget] = useState('');
  const [isRecordsOpen, setIsRecordsOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let resolvedGroup = 'RESEARCHER';
        if (user.email.toLowerCase().includes('admin') || user.email.toLowerCase().endsWith('@uhn.ca')) {
          resolvedGroup = 'ADMIN';
        }
        setLoggedInUserEmail(user.email);
        setLoggedInUserGroup(resolvedGroup);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setAppInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentTab('overview');
    } catch (err) {
      console.error(err);
    }
  };

  if (appInitializing) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '13px' }}>
        Verifying authorization signature token context...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginGate onLoginSuccess={(group, email) => { setLoggedInUserGroup(group); setLoggedInUserEmail(email); setIsAuthenticated(true); }} />;
  }

  const baseButtonStyle = {
    position: 'relative',
    textAlign: 'left',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.12s ease'
  };

  // Modern clinical dashboard high-contrast state styling
  const getRootButtonStyle = (tabName) => ({
    ...baseButtonStyle,
    padding: '10px 14px',
    backgroundColor: currentTab === tabName ? '#ffffff' : 'transparent',
    color: currentTab === tabName ? '#0f172a' : '#475569',
    boxShadow: currentTab === tabName ? '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)' : 'none',
    fontWeight: currentTab === tabName ? '600' : '500'
  });

  const getNestedButtonStyle = (tabName) => ({
    ...baseButtonStyle,
    padding: '9px 12px 9px 24px', 
    backgroundColor: currentTab === tabName ? '#ffffff' : 'transparent',
    color: currentTab === tabName ? '#0f172a' : '#64748b',
    boxShadow: currentTab === tabName ? '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)' : 'none',
    fontWeight: currentTab === tabName ? '600' : '500'
  });

  const getIconColor = (tabName) => (currentTab === tabName ? '#0284c7' : '#94a3b8');

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', margin: 0, fontFamily: '"Open Sans", sans-serif', backgroundColor: '#f1f5f9', color: '#334155' }}>
      
      {/* SIDEBAR NAVIGATION PANEL - CLINICAL RESEARCH LIGHT LAB SHADE */}
      <div style={{ width: '240px', backgroundColor: '#f8fafc', color: '#334155', padding: '24px 0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', borderRight: '1px solid #e2e8f0' }}>
        
        {/* BRAND IDENTITY LOGO HEADER */}
        <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="https://pmcdi.ca/wp-content/uploads/2026/05/UHN-Logo-RGB_Blue-PM-scaled.png" 
            alt="UHN Logo" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              objectFit: 'contain',
              maxHeight: '52px',
              display: 'block'
            }} 
          />
        </div>
        
        {/* Menu Items Link Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 12px', gap: '4px' }}>
          
          {/* ROOT LEVEL LINK: OVERVIEW */}
          <button onClick={() => setCurrentTab('overview')} style={getRootButtonStyle('overview')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('overview')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span>Overview</span>
          </button>

          <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 12px 8px 12px' }} />

          {/* COLLAPSIBLE ACCORDION CATEGORY BUTTON */}
          <button 
            onClick={() => setIsRecordsOpen(!isRecordsOpen)}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
              background: 'none', border: 'none', padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit',
              color: '#0284c7', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase',
              outline: 'none'
            }}
          >
            <span>Records</span>
            <svg 
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: isRecordsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', color: '#0284c7' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Collapsible Tray Area */}
          <div style={{ 
            display: 'flex', flexDirection: 'column', gap: '2px',
            maxHeight: isRecordsOpen ? '160px' : '0px', 
            overflow: 'hidden', 
            transition: 'max-height 0.2s cubic-bezier(0, 0, 0.2, 1)' 
          }}>
            <button onClick={() => setCurrentTab('models')} style={getNestedButtonStyle('models')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('models')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span style={{ marginLeft: '10px' }}>Models</span>
            </button>

            <button onClick={() => { setStudySearchTarget(''); setCurrentTab('studies'); }} style={getNestedButtonStyle('studies')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('studies')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span style={{ marginLeft: '10px' }}>Studies</span>
            </button>

            <button onClick={() => setCurrentTab('samples')} style={getNestedButtonStyle('samples')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('samples')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5" />
                <path d="M12 2a5 5 0 0 0-5 5v3.5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
              </svg>
              <span style={{ marginLeft: '10px' }}>Samples</span>
            </button>
          </div>

          <div style={{ flexGrow: 1 }} />

          {/* ROOT LEVEL LINK: SETTINGS */}
          <button onClick={() => setCurrentTab('settings')} style={getRootButtonStyle('settings')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('settings')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>

        </div>

        {/* ALIGNED PROFILE FOOTER */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 4px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {loggedInUserEmail}
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '4px', padding: '6px 0', fontSize: '11px', fontWeight: '600', cursor: 'pointer', width: '100%', fontFamily: 'inherit', transition: 'all 0.1s ease', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            Sign out
          </button>
        </div>

      </div>

      {/* VIEWPORT PRESENTATION DISPATCHER */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', boxSizing: 'border-box' }}>
        {currentTab === 'overview' ? (
          <DashboardOverview userRole={loggedInUserGroup} onNavigate={(tab) => setCurrentTab(tab)} />
        ) : currentTab === 'models' ? (
          <ModelsRegistry onStudyLinkClick={(name) => { setStudySearchTarget(name); setCurrentTab('studies'); }} />
        ) : currentTab === 'samples' ? (
          <BioSamplesRegistry userRole={loggedInUserGroup} />
        ) : currentTab === 'settings' ? (
          <SettingsWorkspace userRole={loggedInUserGroup} userEmail={loggedInUserEmail} />
        ) : (
          <StudiesManagement initialSearchQuery={studySearchTarget} clearInitialSearch={() => setStudySearchTarget('')} />
        )}
      </div>

    </div>
  );
}