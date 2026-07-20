import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ModelForm from './ModelForm';

const BACKEND_URL = 'http://localhost:8080';

export default function ModelsRegistry({ readOnly = false, onStudyLinkClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  
  const [models, setModels] = useState([]);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [editingModelDisplayName, setEditingModelDisplayName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [inputModelIdentifier, setInputModelIdentifier] = useState('');
  const [inputSelectedStudy, setInputSelectedStudy] = useState('');

  // Dropdown ref tracking
  const [activeMenuIdx, setActiveMenuIdx] = useState(null);
  const menuRef = useRef(null);

  const fetchModelsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { exactmatch: exactMatch };
      if (searchQuery.trim() !== '') {
        params.modeldisplayname = searchQuery;
      }
      const response = await axios.get(`${BACKEND_URL}/api/models`, { params });
      
      if (response.status === 204 || !response.data) {
        setModels([]);
      } else if (Array.isArray(response.data)) {
        setModels(response.data);
      } else {
        setModels([]);
      }
    } catch (err) {
      console.error(err);
      setError("Network connection error. Unable to load baseline target indices.");
    } finally {
      setLoading(false);
    }
  };

  const loadStudiesDropdownOptions = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/studies`);
      if (response.data && Array.isArray(response.data)) {
        setStudies(response.data);
      }
    } catch (err) {
      console.error("Unable to seed study relationship anchors", err);
    }
  };

  useEffect(() => {
    fetchModelsData();
    loadStudiesDropdownOptions();
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchModelsData();
  };

  const openAddModal = () => {
    if (readOnly) return; 
    setFormMode('add');
    setInputModelIdentifier('');
    setInputSelectedStudy('');
    setIsFormOpen(true);
    setActiveMenuIdx(null);
  };

  const openEditModal = (model, idx) => {
    if (readOnly) return; 
    setFormMode('edit');
    setSelectedIdx(idx);
    
    // FIX: Fallback to constructed identifier if modelDisplayName is missing/null
    const calculatedDisplayName = model.modelDisplayName || `${model.studyShortName || ''}${model.modelIdentifier || ''}`;
    setEditingModelDisplayName(calculatedDisplayName);
    
    setInputModelIdentifier(model.modelIdentifier || '');
    setInputSelectedStudy(model.studyShortName || '');
    setIsFormOpen(true);
    setActiveMenuIdx(null);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (readOnly) return; 
    if (!inputModelIdentifier.trim() || !inputSelectedStudy) return;

    // Calculate the combined display name to prevent backend NullPointerExceptions
    const calculatedDisplayName = `${inputSelectedStudy}${inputModelIdentifier}`;

    const payload = {
      modelIdentifier: inputModelIdentifier,
      studyShortName: inputSelectedStudy,
      modelDisplayName: calculatedDisplayName
    };

    setError(null);
    try {
      if (formMode === 'add') {
        const response = await axios.post(`${BACKEND_URL}/api/models`, payload);
        if (response.status === 201 || response.status === 200) {
          setModels(prev => [...prev, response.data]);
          setIsFormOpen(false);
        }
      } else {
        const response = await axios.put(`${BACKEND_URL}/api/models/${editingModelDisplayName}`, payload);
        // Accepting either 200 or 201 matches the backend PUT behavior cleanly
        if (response.status === 200 || response.status === 201) {
          setModels(prev => {
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
        setError("Conflict identity flag. This specific model configuration already exists.");
      } else {
        setError("Synchronization failure during model tracking updates.");
      }
    }
  };

  const handleDeleteRecord = async (model, idx) => {
    if (readOnly) return; 
    setActiveMenuIdx(null);
    const displayName = model.modelDisplayName || `${model.studyShortName}${model.modelIdentifier}`;
    if (!window.confirm(`Permanently drop tracking metrics for ${displayName}?`)) return;
    
    setError(null);
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/models/${displayName}`);
      if (response.status === 204 || response.status === 200) {
        setModels(prev => prev.filter((_, i) => i !== idx));
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 406) {
        setError("Action rejected. This model contains dependent bio-samples and cannot be removed.");
      } else {
        setError("Pipeline action rejected. Database removal error.");
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#0f172a' }}>Models Registry</h1>
        </div>
        
        {/* Render "+ Register Model" button only for Admins */}
        {!readOnly && (
          <button 
            onClick={openAddModal}
            style={{ 
              backgroundColor: '#0284c7', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '10px 16px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' 
            }}
          >
            + Register Model
          </button>
        )}
      </div>

      {/* Query Filters */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <input 
          type="text" 
          placeholder="Search by unique model designation ID..."
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
          {loading ? 'Searching...' : 'Run Query'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px 16px', color: '#991b1b', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Pop-up Overlay Component Insertion */}
      {isFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '360px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
              {formMode === 'add' ? 'Register New Model' : 'Modify Model Parameters'}
            </h3>
            <ModelForm 
              formMode={formMode}
              readOnly={readOnly}
              inputModelIdentifier={inputModelIdentifier}
              setInputModelIdentifier={setInputModelIdentifier}
              inputSelectedStudy={inputSelectedStudy}
              setInputSelectedStudy={setInputSelectedStudy}
              studiesList={studies}
              onSave={handleSaveRecord}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Registry Record Table Frame */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
              <th style={{ padding: '14px 16px' }}>Model ID Designation</th>
              <th style={{ padding: '14px 16px' }}>Associated Study</th>
              
              {/* Render actions column only for Admins */}
              {!readOnly && <th style={{ padding: '14px 16px', width: '80px', textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody style={{ color: '#334155' }}>
            {loading ? (
              <tr>
                <td colSpan={readOnly ? "2" : "3"} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Querying database index keys...
                </td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? "2" : "3"} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No indexed asset records found.
                </td>
              </tr>
            ) : (
              models.map((model, idx) => {
                const displayId = model.modelDisplayName || `${model.studyShortName || ''}${model.modelIdentifier || ''}`;
                
                return (
                  <tr key={displayId + idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {displayId || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                        {model.studyShortName || 'Unassigned'}
                      </span>
                    </td>
                    
                    {/* Render actions button menu only for Admins */}
                    {!readOnly && (
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveMenuIdx(activeMenuIdx === idx ? null : idx); }}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '4px', outline: 'none' }}
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
                            style={{ position: 'absolute', right: '16px', top: '34px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 10, width: '100px', padding: '4px 0', boxSizing: 'border-box' }}
                          >
                            <button 
                              onClick={() => openEditModal(model, idx)}
                              style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '12px', color: '#334155', cursor: 'pointer', fontFamily: 'inherit' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteRecord(model, idx)}
                              style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '12px', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              Delete
                            </button>
                          </div>
                        )}

                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}