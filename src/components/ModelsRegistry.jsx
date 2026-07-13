import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ModelForm from './ModelForm';

const BACKEND_URL = 'http://localhost:8080';

export default function ModelsRegistry() {
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

  // Fetch Models Data matched to @RequestParam(name = "modeldisplayname")
  const fetchModelsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { exactmatch: exactMatch };
      if (searchQuery.trim() !== '') {
        params.modeldisplayname = searchQuery; // Matches backend @RequestParam exactly
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
      setError("Network tie interrupted. Unable to poll active baseline registry profiles.");
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
    setFormMode('add');
    setInputModelIdentifier('');
    setInputSelectedStudy('');
    setIsFormOpen(true);
    setActiveMenuIdx(null);
  };

  const openEditModal = (model, idx) => {
    setFormMode('edit');
    setSelectedIdx(idx);
    setEditingModelDisplayName(model.modelDisplayName); // Tracking target path variable
    setInputModelIdentifier(model.modelIdentifier || '');
    setInputSelectedStudy(model.studyShortName || '');
    setIsFormOpen(true);
    setActiveMenuIdx(null);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!inputModelIdentifier.trim() || !inputSelectedStudy) return;

    // Matches Java Model entity field layout structure
    const payload = {
      modelIdentifier: inputModelIdentifier,
      studyShortName: inputSelectedStudy
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
        // Matches @PutMapping("/models/{modeldisplayname}")
        const response = await axios.put(`${BACKEND_URL}/api/models/${editingModelDisplayName}`, payload);
        if (response.status === 200) {
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
        setError("Synchronization layer exception caught while tracking specifications.");
      }
    }
  };

  const handleDeleteRecord = async (model, idx) => {
    setActiveMenuIdx(null);
    const displayName = model.modelDisplayName || `${model.studyShortName}${model.modelIdentifier}`;
    if (!window.confirm(`Permanently drop tracking metrics for ${displayName}?`)) return;
    
    setError(null);
    try {
      // Matches @DeleteMapping("/models/{modeldisplayname}")
      const response = await axios.delete(`${BACKEND_URL}/api/models/${displayName}`);
      if (response.status === 204 || response.status === 200) {
        setModels(prev => prev.filter((_, i) => i !== idx));
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 406) {
        setError("Action rejected. This model contains dependent bio-samples and cannot be removed.");
      } else {
        setError("Database command execution failed during core pipeline clear.");
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Models registry</h1>
        <button 
          onClick={openAddModal}
          style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 14px', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          + Register model
        </button>
      </div>
      <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '13px' }}>Preclinical xenograft and cell-line asset indices</p>

      {/* Query Bar Filters */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Search by unique model designation ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '320px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', color: '#0f172a' }}
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={exactMatch}
            onChange={(e) => setExactMatch(e.target.checked)}
            style={{ cursor: 'pointer' }} 
          />
          Exact alignment match
        </label>

        <button type="submit" disabled={loading} style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 16px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Searching...' : 'Run Query'}
        </button>
      </form>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '4px', fontSize: '13px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Pop-up Overlay Component Insertion */}
      {isFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '340px' }}>
            <ModelForm 
              formMode={formMode}
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
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Model ID designation</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Associated study short name</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#475569', width: '64px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ color: '#334155' }}>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  Loading models database layers...
                </td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No indexed asset registry rows found matching your system views.
                </td>
              </tr>
            ) : (
              models.map((model, idx) => {
                // Safely falls back to built string if display name hasn't updated yet
                const displayId = model.modelDisplayName || `${model.studyShortName || ''}${model.modelIdentifier || ''}`;
                
                return (
                  <tr key={displayId + idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                      {displayId || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                        {model.studyShortName || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                      
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