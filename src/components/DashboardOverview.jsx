import React, { useState, useEffect } from 'react';

export default function DashboardOverview(props) {
  // 1. Destructure userEmail here alongside your other props
  const { userRole, setCurrentTab, userEmail } = props; 
  
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const API_BASE = 'http://localhost:8080/api/biosamples';

  // --- Bulletproof Email Finder ---
  const findEmailInProps = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string' && obj.includes('@')) {
      return obj;
    }
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const result = findEmailInProps(obj[key]);
          if (result) return result;
        }
      }
    }
    return null;
  };

  // 2. Look for userEmail first, use your recursive finder as a backup, then fallback to system default
  const displayEmail = userEmail || findEmailInProps(props) || 'no-reply@system.local';
  useEffect(() => {
    const checkHealthAndFetch = async () => {
      try {
        const response = await fetch(API_BASE);
        setIsBackendOnline(true);
        if (response.status === 200) {
          const data = await response.json();
          setSamples(Array.isArray(data) ? data : []);
        } else if (response.status === 204) {
          setSamples([]);
        }
      } catch (err) {
        console.error('System API connection failed:', err);
        setIsBackendOnline(false);
        setSamples([]);
      } finally {
        setLoading(false);
      }
    };
    checkHealthAndFetch();
  }, []);

  // --- Flexible Aggregation Logic ---
  const totalSamples = samples.length;

  // 1. Calculate Models: Check for any model, modelId, modelName, or associated identifier
  const modelsLinked = samples.filter(s => {
    const modelKey = s.modelDisplayName || s.modelId || s.modelName || s.model || s.associatedModel;
    return modelKey !== undefined && modelKey !== null && String(modelKey).trim() !== '';
  }).length;

  // 2. Calculate Studies: Scans for keys containing "study", "project", or fallback to unique IDs
  const uniqueStudiesCount = new Set(
    samples
      .map(s => {
        // Dynamically find any key in the object that has "study" in its name
        const studyKey = Object.keys(s).find(k => k.toLowerCase().includes('study'));
        return studyKey ? s[studyKey] : (s.studyId || s.studyName || s.study || s.projectId || s.id || '');
      })
      .filter(val => val !== undefined && val !== null && String(val).trim() !== '')
  ).size;

  const exportToCSV = () => {
    if (samples.length === 0) {
      alert('No records available to export.');
      return;
    }
    const headers = ['ID', 'Sample ID', 'Model ID', 'Study Context'];
    const rows = samples.map(s => [
      s.id || '',
      s.sampleId || s.id || '',
      s.modelDisplayName || s.modelId || s.modelName || s.model || '',
      s.studyId || s.studyName || s.study || ''
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ModelTracker_Manifest_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      maxWidth: '1100px', 
      margin: '0 auto', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#ffffff',
      padding: '32px 16px'
    }}>
      
      {/* Header Panel */}
      <div style={{ 
        backgroundColor: '#1e293b', 
        color: '#ffffff', 
        padding: '32px 24px', 
        borderRadius: '8px',
        marginBottom: '32px'
      }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '600', color: '#f8fafc' }}>
          ModelTracker Registry Hub
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: '500', color: '#94a3b8', letterSpacing: '0.025em' }}>
          {displayEmail}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
            Inventory
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Samples</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                {loading ? '...' : totalSamples}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Models</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                {loading ? '...' : modelsLinked}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>Studies</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                {loading ? '...' : uniqueStudiesCount}
              </div>
            </div>

          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
            Infrastructure
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>Gateway</div>
              <span style={{ 
                display: 'inline-block',
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '600', 
                backgroundColor: isBackendOnline ? '#dcfce7' : '#fee2e2', 
                color: isBackendOnline ? '#15803d' : '#b91c1c' 
              }}>
                {isBackendOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>Database</div>
              <span style={{ 
                display: 'inline-block',
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '600', 
                backgroundColor: isBackendOnline ? '#dcfce7' : '#fee2e2', 
                color: isBackendOnline ? '#15803d' : '#b91c1c' 
              }}>
                {isBackendOnline ? 'STABLE' : 'UNREACHABLE'}
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase' }}>Role</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0284c7' }}>
                {userRole}
              </div>
            </div>

          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px', 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '24px',
          marginTop: '12px'
        }}>
          <button 
            onClick={() => setCurrentTab('samples')}
            style={{
              backgroundColor: '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
          >
            Manage Data Records
          </button>
          
          <button 
            onClick={exportToCSV}
            disabled={loading || samples.length === 0}
            style={{
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (loading || samples.length === 0) ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s',
              opacity: (loading || samples.length === 0) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading && samples.length > 0) {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#1e293b';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#475569';
            }}
          >
            Export Manifest CSV
          </button>
        </div>

      </div>
    </div>
  );
}