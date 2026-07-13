import React, { useState, useEffect } from 'react';

export default function BioSamplesRegistry({ userRole }) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sampleDescriptor: '',
    modelDisplayName: '',
    protocolParticipantID: '',
    barcode: '',
    sampleType: '',
    primaryDiseaseSite: '',
    collectionDate: '',
    interventionDescription: '',
    interventionStartDate: '',
    interventionEndDate: '',
    comment: ''
  });

  const API_BASE = 'http://localhost:8080/api/biosamples'; 

  const fetchSamples = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_BASE);
      if (response.status === 204) {
        setSamples([]);
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch samples: ${response.statusText}`);
      }
      const data = await response.json();
      setSamples(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the biosamples repository API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingId(null);
    // Explicitly stripping out the 'id' key entirely so Hibernate executes an INSERT rather than an UPDATE
    setFormData({
      sampleDescriptor: '',
      modelDisplayName: '',
      protocolParticipantID: '',
      barcode: '',
      sampleType: '',
      primaryDiseaseSite: '',
      collectionDate: '',
      interventionDescription: '',
      interventionStartDate: '',
      interventionEndDate: '',
      comment: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sample) => {
    setEditingId(sample.id);
    setFormData({
      id: sample.id,
      sampleDescriptor: sample.sampleDescriptor || '',
      modelDisplayName: sample.modelDisplayName || '',
      protocolParticipantID: sample.protocolParticipantID || '',
      barcode: sample.barcode || '',
      sampleType: sample.sampleType || '',
      primaryDiseaseSite: sample.primaryDiseaseSite || '',
      collectionDate: sample.collectionDate || '',
      interventionDescription: sample.interventionDescription || '',
      interventionStartDate: sample.interventionStartDate || '',
      interventionEndDate: sample.interventionEndDate || '',
      comment: sample.comment || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const method = editingId ? 'PUT' : 'POST';

    // Deep copy form entries to handle database transmission payload constraints safely
    const payload = { ...formData };
    if (!editingId) {
      delete payload.id; // Guarantee no id primitive property passes down into POST mapping pipeline
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        setError('A biosample with this Sample Descriptor already exists.');
        return;
      }
      if (response.status === 406) {
        setError('Action rejected by server validation constraints.');
        return;
      }
      if (!response.ok) {
        throw new Error('Server returned an error structural code response.');
      }

      setIsModalOpen(false);
      fetchSamples();
    } catch (err) {
      console.error(err);
      setError('Failed to save biosample data. Verification validation context failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this biosample record?')) return;
    setError('');

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });

      if (response.status === 406) {
        alert('Cannot delete sample: This record contains active dependencies or downstream STR analysis metrics.');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to delete sample.');
      }

      fetchSamples();
    } catch (err) {
      console.error(err);
      setError('Failed to execute target baseline removal on asset.');
    }
  };

  const isReadOnly = userRole === 'RESEARCHER';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: '#0f172a' }}>BioSamples Registry</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Manage and index patient-derived biological materials</p>
        </div>
        {!isReadOnly && (
          <button onClick={openAddModal} style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            + Register Sample
          </button>
        )}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px 16px', color: '#991b1b', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>Querying microservice pipeline context...</div>
      ) : samples.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No biological samples currently registered in this workspace environment.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                <th style={{ padding: '14px 16px' }}>Sample Descriptor</th>
                <th style={{ padding: '14px 16px' }}>Model Link</th>
                <th style={{ padding: '14px 16px' }}>Participant ID</th>
                <th style={{ padding: '14px 16px' }}>Barcode</th>
                <th style={{ padding: '14px 16px' }}>Type</th>
                <th style={{ padding: '14px 16px' }}>Disease Site</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ color: '#334155' }}>
              {samples.map((sample) => (
                <tr key={sample.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{sample.sampleDescriptor}</td>
                  <td style={{ padding: '14px 16px' }}>{sample.modelDisplayName || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>{sample.protocolParticipantID || '—'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569' }}>{sample.barcode || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                      {sample.sampleType || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{sample.primaryDiseaseSite || '—'}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => openEditModal(sample)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginRight: '12px' }}>
                      {isReadOnly ? 'View Details' : 'Edit'}
                    </button>
                    {!isReadOnly && (
                      <button onClick={() => handleDelete(sample.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD MANAGEMENT MODAL TRAY */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                {isReadOnly ? 'Biosample Metadata Context' : editingId ? 'Modify Biosample Parameters' : 'Register New Biological Sample Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ margin: 0 }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Sample Descriptor *</label>
                    <input type="text" name="sampleDescriptor" required disabled={isReadOnly} value={formData.sampleDescriptor} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Model Display Name</label>
                    <input type="text" name="modelDisplayName" disabled={isReadOnly} value={formData.modelDisplayName} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Protocol Participant ID</label>
                    <input type="text" name="protocolParticipantID" disabled={isReadOnly} value={formData.protocolParticipantID} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Barcode</label>
                    <input type="text" name="barcode" disabled={isReadOnly} value={formData.barcode} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Sample Type</label>
                    <input type="text" name="sampleType" placeholder="e.g. Primary Tumor, Met" disabled={isReadOnly} value={formData.sampleType} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Primary Disease Site</label>
                    <input type="text" name="primaryDiseaseSite" disabled={isReadOnly} value={formData.primaryDiseaseSite} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Collection Date</label>
                    <input type="text" name="collectionDate" placeholder="YYYY-MM-DD" disabled={isReadOnly} value={formData.collectionDate} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Intervention Start</label>
                    <input type="text" name="interventionStartDate" placeholder="YYYY-MM-DD" disabled={isReadOnly} value={formData.interventionStartDate} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Intervention End</label>
                    <input type="text" name="interventionEndDate" placeholder="YYYY-MM-DD" disabled={isReadOnly} value={formData.interventionEndDate} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Intervention Description</label>
                  <input type="text" name="interventionDescription" disabled={isReadOnly} value={formData.interventionDescription} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Comments / Laboratory Observations</label>
                  <textarea name="comment" rows="3" disabled={isReadOnly} value={formData.comment} onChange={handleInputChange} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {isReadOnly ? 'Close' : 'Cancel'}
                </button>
                {!isReadOnly && (
                  <button type="submit" style={{ backgroundColor: '#0284c7', border: 'none', color: '#ffffff', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                    Save Changes
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}