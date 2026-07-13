import React from 'react';

export default function ModelForm({ formMode, inputModelIdentifier, setInputModelIdentifier, inputSelectedStudy, setInputSelectedStudy, studiesList, onSave, onCancel }) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
        {formMode === 'add' ? 'Register new preclinical model' : 'Edit model specifications'}
      </div>
      
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Model ID / Name */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Model designation suffix / ID</div>
          <input 
            type="text" 
            value={inputModelIdentifier} 
            onChange={e => setInputModelIdentifier(e.target.value)}
            disabled={formMode === 'edit'} 
            required 
            placeholder="e.g., -PDA-01X"
            style={{ padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: formMode === 'edit' ? '#f8fafc' : '#ffffff' }}
          />
        </div>

        {/* Associated Study Relationship Mapping */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Associated clinical protocol / Study</div>
          <select
            value={inputSelectedStudy}
            onChange={e => setInputSelectedStudy(e.target.value)}
            required
            style={{ padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="" disabled>Select parent clinical protocol...</option>
            {studiesList.map((study) => (
              <option key={study.studyShortName} value={study.studyShortName}>
                {study.studyShortName}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onCancel} style={{ backgroundColor: '#ffffff', color: '#64748b', padding: '8px 14px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 14px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
            Save specifications
          </button>
        </div>
      </form>
    </div>
  );
}