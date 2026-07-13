import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080';

export default function STRAnalysisRegistry({ userRole }) {
  const [strRecords, setStrRecords] = useState([]);
  const [samples, setSamples] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sampleDescriptor: '',
    receivingDate: new Date().toISOString().split('T')[0],
    markerName: 'AMEL',
    alleleValues: ''
  });

  const [activeMenuIdx, setActiveMenuIdx] = useState(null);
  const menuRef = useRef(null);

  // 1. FETCH ALL STR ANALYSES
  const fetchStrData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pull down baseline biosamples to map out options for form selections
      const sampleResponse = await axios.get(`${BACKEND_URL}/api/biosamples`);
      if (sampleResponse.data && Array.isArray(sampleResponse.data)) {
        setSamples(sampleResponse.data);
      }

      // FIXED: Strictly hitting the pluralized backend mapping /api/stranalyses
      const response = await axios.get(`${BACKEND_URL}/api/stranalyses`);
      if (response.status === 204 || !response.data) {
        setStrRecords([]);
      } else if (Array.isArray(response.data)) {
        setStrRecords(response.data);
      } else {
        setStrRecords([]);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Unable to load STR authentication profiles from backend repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      sampleDescriptor: '',
      receivingDate: new Date().toISOString().split('T')[0],
      markerName: 'AMEL',
      alleleValues: ''
    });
    setIsModalOpen(true);
    setActiveMenuIdx(null);
  };

  // 2. REGISTER NEW STR DATA 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sampleDescriptor) return;

    setError(null);
    try {
      const payload = [
        {
          sampleDescriptor: formData.sampleDescriptor,
          receivingDate: formData.receivingDate,
          markerName: formData.markerName,
          alleleValues: formData.alleleValues
        }
      ];

      const response = await axios.post(`${BACKEND_URL}/api/strdatalist`, payload);
      if (response.status === 201 || response.status === 200) {
        setIsModalOpen(false);
        fetchStrData();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to register STR metrics data profile package.");
    }
  };

  // 3. DESIGNATE TARGET ENTRY AS REFERENCE (PATCH)
  const handleSetReference = async (record) => {
    setActiveMenuIdx(null);
    setError(null);
    try {
      const ppid = record.sample?.protocolParticipantID || '';
      const encodedDescriptor = encodeURIComponent(record.sampleDescriptor).replace(/\+/g, '^');
      const url = `${BACKEND_URL}/api/stranalyses?descriptor=${encodedDescriptor}&date=${record.receivingDate}&ppid=${ppid}`;
      
      const response = await axios.patch(url, record);
      if (response.status === 200) {
        fetchStrData();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update profile to align reference status criteria.");
    }
  };

  // 4. PURGE PROFILE RECORD ENTRIES
  const handleDeleteRecord = async (record, idx) => {
    setActiveMenuIdx(null);
    if (!window.confirm(`Permanently remove the STR profile registry mapping for ${record.sampleDescriptor}?`)) return;

    setError(null);
    try {
      const encodedDescriptor = encodeURIComponent(record.sampleDescriptor).replace(/\+/g, '^');
      const response = await axios.delete(
        `${BACKEND_URL}/api/stranalyses?descriptor=${encodedDescriptor}&date=${record.receivingDate}`
      );
      if (response.status === 204 || response.status === 200) {
        setStrRecords(prev => prev.filter((_, i) => i !== idx));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to execute deletion command on target STR profile registry entry.");
    }
  };

  const isReadOnly = userRole === 'RESEARCHER';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Open Sans", sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#0f172a' }}>STR Analysis Registry</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Authenticate genetic purity profiles against control repository metrics</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={openAddModal}
            style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
          >
            + Upload STR Data
          </button>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px 16px', color: '#991b1b', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
              <th style={{ padding: '14px 16px' }}>Sample Descriptor</th>
              <th style={{ padding: '14px 16px' }}>Receiving Date</th>
              <th style={{ padding: '14px 16px' }}>Type Designation</th>
              <th style={{ padding: '14px 16px' }}>Reference Alignment Target</th>
              <th style={{ padding: '14px 16px' }}>Match Authenticity Score</th>
              <th style={{ padding: '14px 16px', width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ color: '#334155' }}>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Loading database records context matrix...
                </td>
              </tr>
            ) : strRecords.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No STR profiles found registered on this system node.
                </td>
              </tr>
            ) : (
              strRecords.map((record, idx) => (
                <tr key={record.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                    {record.sampleDescriptor || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{record.receivingDate || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      backgroundColor: record.isReferenceStr ? '#dcfce7' : '#f1f5f9', 
                      color: record.isReferenceStr ? '#15803d' : '#475569', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: '600' 
                    }}>
                      {record.isReferenceStr ? 'PATIENT REFERENCE' : 'EVALUATION MATERIAL'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {record.refSampleDescriptor ? `${record.refSampleDescriptor} (${record.refReceivingDate})` : 'Self-Referenced'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: record.percentageStrMatch >= 0.8 ? '#15803d' : '#334155' }}>
                    {record.percentageStrMatch !== undefined ? `${(record.percentageStrMatch * 100).toFixed(1)}%` : '—'}
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px', fontWeight: '400' }}>
                      ({record.matchCount || 0}/{record.totalCount || 0} loci)
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(activeMenuIdx === idx ? null : idx); }}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', outline: 'none' }}
                    >
                      <svg width="14" height="4" viewBox="0 0 14 4" fill="currentColor">
                        <circle cx="2" cy="2" r="1.75" />
                        <circle cx="7" cy="2" r="1.75" />
                        <circle cx="12" cy="2" r="1.75" />
                      </svg>
                    </button>

                    {activeMenuIdx === idx && (
                      <div 
                        ref={menuRef}
                        style={{ position: 'absolute', right: '16px', top: '34px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 10, width: '140px', padding: '4px 0', boxSizing: 'border-box' }}
                      >
                        {!isReadOnly && !record.isReferenceStr && (
                          <button 
                            onClick={() => handleSetReference(record)}
                            style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '12px', color: '#0284c7', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f9ff'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            Set Reference
                          </button>
                        )}
                        {!isReadOnly && (
                          <button 
                            onClick={() => handleDeleteRecord(record, idx)}
                            style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '12px', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            Delete Profile
                          </button>
                        )}
                        {isReadOnly && (
                          <div style={{ padding: '6px 12px', fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>No Actions</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
              Register Raw STR Metrics Profile
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Target Lab BioSample Alignment *</label>
                  <select 
                    name="sampleDescriptor" 
                    required 
                    value={formData.sampleDescriptor} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- Select Registered BioSample ID --</option>
                    {samples.map(s => (
                      <option key={s.id} value={s.sampleDescriptor}>{s.sampleDescriptor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Profiling Assessment Date</label>
                  <input 
                    type="date" 
                    name="receivingDate" 
                    required
                    value={formData.receivingDate} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Control Marker Locus</label>
                  <select
                    name="markerName"
                    value={formData.markerName}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', backgroundColor: '#ffffff' }}
                  >
                    <option value="AMEL">AMEL (Amelogenin Sex Chromosome)</option>
                    <option value="vWA">vWA</option>
                    <option value="TH01">TH01</option>
                    <option value="D21S11">D21S11</option>
                    <option value="D5S818">D5S818</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Allele Peak Repeats Value Matrix</label>
                  <input 
                    type="text" 
                    name="alleleValues" 
                    required
                    placeholder="e.g. 14, 16.2" 
                    value={formData.alleleValues} 
                    onChange={handleInputChange} 
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} 
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ backgroundColor: '#0284c7', border: 'none', color: '#ffffff', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                  Submit Profiling Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}