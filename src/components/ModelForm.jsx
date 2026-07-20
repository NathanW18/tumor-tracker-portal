import React from 'react';

export default function ModelForm({ 
  formMode, 
  inputModelIdentifier, 
  setInputModelIdentifier, 
  inputSelectedStudy, 
  setInputSelectedStudy, 
  inputProtocolParticipantID,
  setInputProtocolParticipantID,
  inputParentModelDisplayName,
  setInputParentModelDisplayName,
  inputComment,
  setInputComment,
  studiesList, 
  onSave, 
  onCancel 
}) {
  const isViewMode = formMode === 'view';

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '24px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', boxSizing: 'border-box', width: '100%' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
        {formMode === 'add' ? 'Register new preclinical model' : 
         formMode === 'edit' ? 'Edit model specifications' : 
         'Preclinical model details'}
      </div>
      
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Model ID / Name - Immutable in view and edit */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Model designation suffix / ID</div>
          <input 
            type="text" 
            value={inputModelIdentifier} 
            onChange={e => setInputModelIdentifier(e.target.value)}
            disabled={formMode === 'edit' || isViewMode} 
            required 
            placeholder="e.g., -PDA-01X"
            style={{ 
              padding: '8px 12px', 
              fontSize: '13px', 
              fontFamily: 'inherit', 
              borderRadius: '4px', 
              border: '1px solid #cbd5e1', 
              outline: 'none', 
              width: '100%', 
              boxSizing: 'border-box', 
              backgroundColor: (formMode === 'edit' || isViewMode) ? '#f8fafc' : '#ffffff' 
            }}
          />
        </div>

        {/* Associated Study Relationship Mapping - Immutable in view and edit */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Associated clinical protocol / Study</div>
          <select
            value={inputSelectedStudy}
            onChange={e => setInputSelectedStudy(e.target.value)}
            disabled={formMode === 'edit' || isViewMode} 
            required
            style={{ 
              padding: '8px 12px', 
              fontSize: '13px', 
              fontFamily: 'inherit', 
              borderRadius: '4px', 
              border: '1px solid #cbd5e1', 
              outline: 'none', 
              width: '100%', 
              boxSizing: 'border-box', 
              backgroundColor: (formMode === 'edit' || isViewMode) ? '#f8fafc' : '#ffffff', 
              cursor: (formMode === 'edit' || isViewMode) ? 'not-allowed' : 'pointer' 
            }}
          >
            <option value="" disabled>Select parent clinical protocol...</option>
            {studiesList.map((study) => (
              <option key={study.studyShortName} value={study.studyShortName}>
                {study.studyShortName}
              </option>
            ))}
          </select>
        </div>

        {/* Protocol Participant ID */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Protocol Participant ID</div>
          <input 
            type="text" 
            value={inputProtocolParticipantID} 
            onChange={e => setInputProtocolParticipantID(e.target.value)}
            disabled={isViewMode}
            placeholder={isViewMode ? '—' : 'e.g., G_12345'}
            style={{ 
              padding: '8px 12px', 
              fontSize: '13px', 
              fontFamily: 'inherit', 
              borderRadius: '4px', 
              border: '1px solid #cbd5e1', 
              outline: 'none', 
              width: '100%', 
              boxSizing: 'border-box', 
              backgroundColor: isViewMode ? '#f8fafc' : '#ffffff' 
            }}
          />
        </div>

        {/* Parent Model Display Name */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Parent Model Display Name</div>
          <input 
            type="text" 
            value={inputParentModelDisplayName} 
            onChange={e => setInputParentModelDisplayName(e.target.value)}
            disabled={isViewMode}
            placeholder={isViewMode ? '—' : 'e.g., TEST001'}
            style={{ 
              padding: '8px 12px', 
              fontSize: '13px', 
              fontFamily: 'inherit', 
              borderRadius: '4px', 
              border: '1px solid #cbd5e1', 
              outline: 'none', 
              width: '100%', 
              boxSizing: 'border-box', 
              backgroundColor: isViewMode ? '#f8fafc' : '#ffffff' 
            }}
          />
        </div>

        {/* Comment */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Comment</div>
          <textarea 
            value={inputComment} 
            onChange={e => setInputComment(e.target.value)}
            disabled={isViewMode}
            placeholder={isViewMode ? 'No remarks logged.' : 'Add comments or notes...'}
            rows="3"
            style={{ 
              padding: '8px 12px', 
              fontSize: '13px', 
              fontFamily: 'inherit', 
              borderRadius: '4px', 
              border: '1px solid #cbd5e1', 
              outline: 'none', 
              width: '100%', 
              boxSizing: 'border-box', 
              backgroundColor: isViewMode ? '#f8fafc' : '#ffffff', 
              resize: isViewMode ? 'none' : 'vertical' 
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          {isViewMode ? (
            <button 
              type="button" 
              onClick={onCancel} 
              style={{ 
                backgroundColor: '#0f172a', 
                color: '#ffffff', 
                padding: '8px 16px', 
                fontSize: '13px', 
                fontWeight: '600', 
                fontFamily: 'inherit', 
                borderRadius: '4px', 
                border: 'none', 
                cursor: 'pointer' 
              }}
            >
              Close details
            </button>
          ) : (
            <>
              <button type="button" onClick={onCancel} style={{ backgroundColor: '#ffffff', color: '#64748b', padding: '8px 14px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '8px 14px', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                Save specifications
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}