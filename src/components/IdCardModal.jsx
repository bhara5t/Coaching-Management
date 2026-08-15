import React from 'react';
import { Printer, X, User } from 'lucide-react';

export default function IdCardModal({ student, db, onClose }) {
  if (!student) return null;

  const batch = db.batches.find(b => b.id === student.batchId);
  const institute = db.instituteProfile;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header no-print">
          <h3 className="card-title">Student Identity Card</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print ID
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body printable-receipt-area" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
          
          {/* ID Card Box */}
          <div style={{
            width: '320px',
            border: '2px solid #2563eb',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(37,99,235,0.15)',
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: 'var(--font-sans)'
          }}>
            
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #2563eb)',
              color: '#ffffff',
              padding: '1.25rem 1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                {institute?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bfdbfe', marginTop: '0.15rem' }}>
                {institute?.tagline || 'Student Identity Card'}
              </div>
            </div>

            {/* Photo & Body */}
            <div style={{ padding: '1.5rem 1.25rem', textAlign: 'center', color: '#0f172a' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#eff6ff',
                border: '3px solid #3b82f6',
                margin: '0 auto 1rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <User size={40} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                {student.name}
              </h3>
              <div style={{
                display: 'inline-block',
                background: '#f1f5f9',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                marginBottom: '1rem'
              }}>
                ROLL #{student.rollNo}
              </div>

              {/* Student Metadata Box */}
              <div style={{
                textAlign: 'left',
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '0.9rem',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                border: '1px solid #e2e8f0',
                color: '#0f172a'
              }}>
                <div style={{ color: '#0f172a' }}>
                  <strong style={{ color: '#334155' }}>Class: </strong>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{student.standard || 'Class 10'}</span>
                </div>
                <div style={{ color: '#0f172a' }}>
                  <strong style={{ color: '#334155' }}>Batch: </strong>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{batch?.name || 'Standard'}</span>
                </div>
                <div style={{ color: '#0f172a' }}>
                  <strong style={{ color: '#334155' }}>Emergency: </strong>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{student.parentPhone || student.phone || 'N/A'}</span>
                </div>
                {student.address && (
                  <div style={{ color: '#0f172a' }}>
                    <strong style={{ color: '#334155' }}>Address: </strong>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{student.address}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.25rem', fontSize: '0.72rem', color: '#64748b' }}>
                {institute?.address} • {institute?.phone}
              </div>
            </div>

          </div>

        </div>

        <div className="modal-footer no-print">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
