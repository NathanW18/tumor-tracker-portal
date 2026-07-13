import React from 'react';

export default function BioSampleForm({ formMode, inputSampleId, setInputSampleId, inputSelectedModel, setInputSelectedModel, modelsList, onSave, onCancel }) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
        {formMode === 'add' ? 'Register new biological sample' : 'Edit sample specifications'}
      </div>
      
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* BioSample Unique ID */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>BioSample unique tracker identifier</div>
          <input 
            type="text" 
            value={inputSampleId} 
            onChange={e => setInputSampleId(e.target.value)}
            disabled={formMode === 'edit'} 
            required 
            placeholder="e.g., SAM-PDA-01X-A"
            style={{ padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: formMode === 'edit' ? '#f8fafc' : '#ffffff' }}
          />
        </div>

        {/* Associated Parent Preclinical Model mapping */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Parent preclinical host model</div>
          <select
            value={inputSelectedModel}
            onChange={e => setInputSelectedModel(e.target.value)}
            required
            style={{ padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="" disabled>Select host model track...</option>
            {modelsList.map((model) => {
              const modelDisplay = model.modelDisplayName || `${model.studyShortName}${model.modelIdentifier}`;
              return (
                <option key={modelDisplay} value={modelDisplay}>
                  {modelDisplay}
                </option>
              );
            })}
          </select>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button type="button" onClick={onCancel} style={{ backgroundColor: '#ffffff', color: '#64748b', padding: '8px 14px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 14px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
            Save sample records
          </button>
        </div>
      </form>
    </div>
  );
}