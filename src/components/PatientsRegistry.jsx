import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

export default function PatientsRegistry({ userRole }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Default search query to something or an empty string, but note that the API requires a string
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      // The backend expects a GET request to /api/ppids with a required query param "modeltracker-ppid"
      const response = await axios.get(`${BACKEND_URL}/api/ppids`, {
        params: {
          'modeltracker-ppid': query
        }
      });
      
      // If the backend returns 204 NO_CONTENT, axios sets response.data to empty or undefined
      if (response.status === 204 || !response.data) {
        setPatients([]);
      } else {
        // The backend returns a List<String>, not objects
        setPatients(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError("Search query cannot be empty.");
      } else {
        setError("Network error. Unable to load protocol participant identifiers.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data using an empty string or standard wildcard/prefix if your service supports it
  useEffect(() => {
    fetchPatients(searchQuery);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Open Sans", sans-serif' }}>
      
      {/* HEADER CONTROLS PLACEMENT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Patients Registry</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Search protocol participant identifiers (PPIDs) mapped within the system.</p>
        </div>
      </div>

      {/* FILTER SEARCH TOOLBAR */}
      <form onSubmit={handleSearchSubmit} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <input 
          type="text"
          placeholder="Enter Protocol Participant ID substring (required)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flexGrow: 1, border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
        />
        <button 
          type="submit"
          style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          Search
        </button>
      </form>

      {/* SYSTEM MESSAGES */}
      {error && <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
      {loading && <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '40px' }}>Querying participant database...</div>}

      {/* DATA VISUALIZATION GRID */}
      {!loading && !error && (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                <th style={{ padding: '14px 16px' }}>Index</th>
                <th style={{ padding: '14px 16px' }}>Protocol Participant ID (PPID)</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No participant IDs found matching that search parameter.</td>
                </tr>
              ) : (
                patients.map((ppid, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', width: '80px' }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{ppid}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}