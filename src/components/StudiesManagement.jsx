import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import StudyForm from './StudyForm';

const BACKEND_URL = 'http://localhost:8080';

export default function StudiesManagement() {
  const [searchSubTab, setSearchSubTab] = useState('shortname');
  const [searchQuery, setSearchQuery] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [editingOriginalShortName, setEditingOriginalShortName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [inputShortName, setInputShortName] = useState('');
  const [inputPi, setInputPi] = useState('');

  const [activeMenuIdx, setActiveMenuIdx] = useState(null);
  const menuRef = useRef(null);

  const fetchStudiesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${BACKEND_URL}/api/studies`;
      const params = { exactmatch: exactMatch };

      if (searchQuery.trim() !== '') {
        if (searchSubTab === 'shortname') {
          params.shortname = searchQuery;
        } else {
          params.pi = searchQuery;
        }
      }

      const response = await axios.get(endpoint, { params });
      
      if (response.status === 204 || !response.data) {
        setStudies([]);
      } else if (Array.isArray(response.data)) {
        setStudies(response.data);
      } else {
        setStudies([]);
      }
    } catch (err) {
      console.error(err);
      setError("Network connection error. Unable to retrieve records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudiesData();
  }, [searchSubTab]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudiesData();
  };

  const openAddModal = () => {
    setFormMode('add');
    setInputShortName('');
    setInputPi('');
    setIsFormOpen(true);
    setActiveMenuIdx(null);
  };

  const openEditModal = (study, idx) => {
    setFormMode('edit');
    setSelectedIdx(idx);
    setEditingOriginalShortName(study.studyShortName);
    setInputShortName(study.studyShortName || '');
    setInputPi(study.principleInvestigator || '');
    setIsFormOpen(true);
    setActiveMenuIdx(null);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!inputShortName.trim() || !inputPi.trim()) return;

    const payload = {
      studyShortName: inputShortName,
      principleInvestigator: inputPi
    };

    setError(null);
    try {
      if (formMode === 'add') {
        const response = await axios.post(`${BACKEND_URL}/api/studies`, payload);
        if (response.status === 201 || response.status === 200) {
          setStudies(prev => [...prev, response.data]);
          setIsFormOpen(false);
        }
      } else {
        const response = await axios.put(`${BACKEND_URL}/api/studies/${editingOriginalShortName}`, payload);
        if (response.status === 200) {
          setStudies(prev => {
            const updated = [...prev];
            updated[selectedIdx] = response.data;
            return updated;
          });
          setIsFormOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError("Conflict error. A study with this short name identity already exists.");
      } else {
        setError("Failed to sync records with the clinical backend server.");
      }
    }
  };

  const handleDeleteRecord = async (study, idx) => {
    setActiveMenuIdx(null);
    if (!window.confirm("Permanently delete this study protocol record?")) return;
    
    setError(null);
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/studies/${study.studyShortName}`);
      if (response.status === 204 || response.status === 200) {
        setStudies(prev => prev.filter((_, i) => i !== idx));
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 406) {
        setError("Action rejected. This study contains dependent preclinical models and cannot be removed.");
      } else {
        setError("Failed to execute deletion command on the remote tier.");
      }
    }
  };

  const toggleDropdown = (e, idx) => {
    e.stopPropagation();
    setActiveMenuIdx(activeMenuIdx === idx ? null : idx);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#0f172a' }}>Studies Management</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Coordinate and audit primary protocol cohorts and investigators</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
        >
          + Add Record
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        <button 
          onClick={() => { setSearchSubTab('shortname'); setSearchQuery(''); }}
          style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', background: searchSubTab === 'shortname' ? '#ffffff' : 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', color: searchSubTab === 'shortname' ? '#0f172a' : '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          Study Short Name
        </button>
        <button 
          onClick={() => { setSearchSubTab('pi'); setSearchQuery(''); }}
          style={{ padding: '8px 14px', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', background: searchSubTab === 'pi' ? '#ffffff' : 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', color: searchSubTab === 'pi' ? '#0f172a' : '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}
        >
          Principal Investigator
        </button>
      </div>

      {/* Query Filters */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <input 
          type="text" 
          placeholder={`Search ${searchSubTab === 'shortname' ? 'short name' : 'investigator'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '320px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={exactMatch}
            onChange={(e) => setExactMatch(e.target.checked)}
            style={{ cursor: 'pointer' }} 
          />
          Exact match
        </label>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '8px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '6px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px 16px', color: '#991b1b', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Pop-up Overlay Modal Backdrop */}
      {isFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '360px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
              {formMode === 'add' ? 'Add Study Record' : 'Modify Study Parameters'}
            </h3>
            <StudyForm 
              formMode={formMode}
              inputShortName={inputShortName}
              setInputShortName={setInputShortName}
              inputPi={inputPi}
              setInputPi={setInputPi}
              onSave={handleSaveRecord}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Table Content */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
              <th style={{ padding: '14px 16px' }}>Study Short Name</th>
              <th style={{ padding: '14px 16px' }}>Principal Investigator</th>
              <th style={{ padding: '14px 16px', width: '80px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ color: '#334155' }}>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Loading study records...
                </td>
              </tr>
            ) : studies.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No studies found in this workspace view.
                </td>
              </tr>
            ) : (
              studies.map((study, idx) => (
                <tr key={study.studyShortName || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                    {study.studyShortName || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {study.principleInvestigator || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                    
                    {/* Compact Dropdown Trigger */}
                    <button 
                      onClick={(e) => toggleDropdown(e, idx)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', outline: 'none' }}
                    >
                      <svg width="14" height="4" viewBox="0 0 14 4" fill="currentColor">
                        <circle cx="2" cy="2" r="1.75" />
                        <circle cx="7" cy="2" r="1.75" />
                        <circle cx="12" cy="2" r="1.75" />
                      </svg>
                    </button>

                    {/* Popover Options Menu */}
                    {activeMenuIdx === idx && (
                      <div 
                        ref={menuRef}
                        style={{ position: 'absolute', right: '16px', top: '34px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 10, width: '100px', padding: '4px 0', boxSizing: 'border-box' }}
                      >
                        <button 
                          onClick={() => openEditModal(study, idx)}
                          style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '12px', color: '#334155', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(study, idx)}
                          style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '12px', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          Delete
                        </button>
                      </div>
                    )}

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}