import React from 'react';

export default function StudyForm({ formMode, inputShortName, setInputShortName, inputPi, setInputPi, onSave, onCancel }) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '16px' }}>
        {formMode === 'add' ? 'Create new protocol record' : 'Edit protocol record'}
      </div>
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Study short name</div>
          <input 
            type="text" 
            value={inputShortName} 
            onChange={e => setInputShortName(e.target.value)}
            disabled={formMode === 'edit'} // Keeps id immutable if database constraint requires it
            required 
            style={{ padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: formMode === 'edit' ? '#f8fafc' : '#ffffff' }}
          />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Principal investigator</div>
          <input 
            type="text" 
            value={inputPi} 
            onChange={e => setInputPi(e.target.value)} 
            required
            style={{ padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onCancel} style={{ backgroundColor: '#ffffff', color: '#64748b', padding: '8px 14px', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 14px', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}