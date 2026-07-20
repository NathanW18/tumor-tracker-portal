import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import LoginGate from './components/LoginGate';
import DashboardOverview from './components/DashboardOverview';
import StudiesManagement from './components/StudiesManagement';
import ModelsRegistry from './components/ModelsRegistry';
import BioSamplesRegistry from './components/BioSamplesRegistry';
import STRAnalysisRegistry from './components/StrAnalysisRegistry'; // Case-sensitive matching StrAnalysisRegistry.jsx
import PatientsRegistry from './components/PatientsRegistry'; 
import SettingsWorkspace from './components/SettingsWorkspace';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');
  const [loggedInUserGroup, setLoggedInUserGroup] = useState('');
  const [appInitializing, setAppInitializing] = useState(true);

  const [currentTab, setCurrentTab] = useState('overview'); 
  const [studySearchTarget, setStudySearchTarget] = useState('');

  // Tab visibility configuration (Admins can toggle these for normal users)
  const [visibleTabs, setVisibleTabs] = useState({
    studies: true,
    models: true,
    samples: true,
    'str-analysis': true,
    patients: true,
  });

  // Load tab visibility settings from localStorage on mount so they persist across refreshes
  useEffect(() => {
    const savedVisibility = localStorage.getItem('uhn_sidebar_tab_visibility');
    if (savedVisibility) {
      try {
        setVisibleTabs(JSON.parse(savedVisibility));
      } catch (e) {
        console.error("Failed to parse tab visibility settings", e);
      }
    }
  }, []);

  const handleToggleTabVisibility = (tabKey) => {
    const updated = {
      ...visibleTabs,
      [tabKey]: !visibleTabs[tabKey]
    };
    setVisibleTabs(updated);
    localStorage.setItem('uhn_sidebar_tab_visibility', JSON.stringify(updated));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let resolvedGroup = 'RESEARCHER'; // Default everyone to RESEARCHER
        const lowerEmail = user.email.toLowerCase();
        
        // STRICT CHECK: Only grant ADMIN if they have an official UHN admin email
        if (lowerEmail.endsWith('@uhn.ca') && lowerEmail.includes('admin')) {
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
        Loading...
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

  // Helper to determine if a tab should be visible to the current user
  const isTabVisible = (tabKey) => {
    if (loggedInUserGroup === 'ADMIN') return true; // Admins always see everything
    return visibleTabs[tabKey] !== false; // Otherwise check configured settings
  };

  // Helper to check if a whole section header should show (if any child tabs are visible)
  const hasVisibleChildren = (tabKeys) => {
    if (loggedInUserGroup === 'ADMIN') return true;
    return tabKeys.some(key => visibleTabs[key] !== false);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', margin: 0, fontFamily: '"Open Sans", sans-serif', backgroundColor: '#f1f5f9', color: '#334155', overflow: 'hidden' }}>
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <div style={{ width: '240px', backgroundColor: '#f8fafc', color: '#334155', padding: '24px 0 0 0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', borderRight: '1px solid #e2e8f0', height: '100%' }}>
        
        {/* BRAND IDENTITY LOGO HEADER */}
        <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <img 
            src="https://pmcdi.ca/wp-content/uploads/2026/05/UHN-Logo-RGB_Blue-PM-scaled.png" // change to your logo URL
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
        
        {/* Main Menu Scroll Container */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '0 12px 24px 12px', gap: '4px', overflowY: 'auto' }}>
          
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

          {/* STATIC RECORDS SECTION */}
          {hasVisibleChildren(['studies', 'models', 'samples', 'str-analysis']) && (
            <>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '12px 12px 8px 12px' }} />
              <div style={{ padding: '8px 12px', color: '#0284c7', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Records
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {isTabVisible('studies') && (
                  <button onClick={() => { setStudySearchTarget(''); setCurrentTab('studies'); }} style={getNestedButtonStyle('studies')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('studies')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span style={{ marginLeft: '10px' }}>Studies</span>
                  </button>
                )}

                {isTabVisible('models') && (
                  <button onClick={() => setCurrentTab('models')} style={getNestedButtonStyle('models')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('models')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span style={{ marginLeft: '10px' }}>Models</span>
                  </button>
                )}

                {isTabVisible('samples') && (
                  <button onClick={() => setCurrentTab('samples')} style={getNestedButtonStyle('samples')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('samples')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5" />
                      <path d="M12 2a5 5 0 0 0-5 5v3.5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
                    </svg>
                    <span style={{ marginLeft: '10px' }}>Samples</span>
                  </button>
                )}

                {isTabVisible('str-analysis') && (
                  <button onClick={() => setCurrentTab('str-analysis')} style={getNestedButtonStyle('str-analysis')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('str-analysis')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="9" x2="20" y2="9" />
                      <line x1="4" y1="15" x2="20" y2="15" />
                      <line x1="10" y1="3" x2="8" y2="21" />
                      <line x1="16" y1="3" x2="14" y2="21" />
                    </svg>
                    <span style={{ marginLeft: '10px' }}>STR Analysis</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* STATIC CLINICAL SECTION */}
          {hasVisibleChildren(['patients']) && (
            <>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '8px 12px' }} />
              <div style={{ padding: '8px 12px', color: '#0284c7', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Clinical
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {isTabVisible('patients') && (
                  <button onClick={() => setCurrentTab('patients')} style={getNestedButtonStyle('patients')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('patients')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span style={{ marginLeft: '10px' }}>Patients</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* ROOT LEVEL LINK: SETTINGS */}
          <button onClick={() => setCurrentTab('settings')} style={{ ...getRootButtonStyle('settings'), marginTop: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('settings')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>

          {/* ADMIN EXCLUSIVE MANAGEMENT TAB */}
          {loggedInUserGroup === 'ADMIN' && (
            <button onClick={() => setCurrentTab('admin-panel')} style={{ ...getRootButtonStyle('admin-panel'), marginTop: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor('admin-panel')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Admin Panel</span>
            </button>
          )}

        </div>

        {/* ALIGNED PROFILE FOOTER */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
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
          <DashboardOverview 
            userRole={loggedInUserGroup} 
            userEmail={loggedInUserEmail}
            setCurrentTab={setCurrentTab} 
          />
        ) : currentTab === 'models' ? (
          <ModelsRegistry 
            readOnly={loggedInUserGroup !== 'ADMIN'} 
            onStudyLinkClick={(name) => { setStudySearchTarget(name); setCurrentTab('studies'); }} 
          />
        ) : currentTab === 'samples' ? (
          <BioSamplesRegistry userRole={loggedInUserGroup} />
        ) : currentTab === 'str-analysis' ? (
          <STRAnalysisRegistry userRole={loggedInUserGroup} />
        ) : currentTab === 'patients' ? (
          <PatientsRegistry userRole={loggedInUserGroup} />
        ) : currentTab === 'settings' ? (
          <SettingsWorkspace userRole={loggedInUserGroup} userEmail={loggedInUserEmail} />
        ) : currentTab === 'admin-panel' ? (
          /* INTERNAL ADMIN PANEL VIEW CONTAINER */
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '24px', maxWidth: '600px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>Admin Panel</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
              Control which sections are visible to non-admin users in the sidebar. Admins will always have visibility over all sections.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.keys(visibleTabs).map((tabKey) => (
                <div key={tabKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '12px 14px', border: '1px solid #f1f5f9', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', textTransform: 'capitalize' }}>
                      {tabKey.replace('-', ' ')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {visibleTabs[tabKey] ? 'Visible to all users' : 'Hidden from non-admins'}
                    </div>
                  </div>
                  
                  {/* Styled Switch Toggle */}
                  <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={visibleTabs[tabKey]} 
                      onChange={() => handleToggleTabVisibility(tabKey)}
                      style={{ opacity: 0, width: 0, height: 0 }} 
                    />
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: visibleTabs[tabKey] ? '#0284c7' : '#cbd5e1',
                      borderRadius: '20px', transition: '0.2s',
                      display: 'flex', alignItems: 'center', padding: '2px'
                    }}>
                      <span style={{
                        height: '16px', width: '16px', borderRadius: '50%', backgroundColor: '#ffffff',
                        transform: visibleTabs[tabKey] ? 'translateX(16px)' : 'translateX(0)',
                        transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <StudiesManagement 
            readOnly={loggedInUserGroup !== 'ADMIN'}
            initialSearchQuery={studySearchTarget} 
            clearInitialSearch={() => setStudySearchTarget('')} 
          />
        )}
      </div>

    </div>
  );
}