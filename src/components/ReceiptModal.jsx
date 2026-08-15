import React from 'react';
import { Printer, MessageSquare, X, CheckCircle, Sparkles } from 'lucide-react';

export default function ReceiptModal({ fee, db, onClose }) {
  if (!fee) return null;

  const student = db.students.find(s => s.id === fee.studentId);
  const batch = db.batches.find(b => b.id === student?.batchId);
  const institute = db.instituteProfile;
  const currency = institute?.currency || '₹';

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        const dateObj = new Date(year, month - 1, day);
        const monthName = dateObj.toLocaleString('en-US', { month: 'long' });
        return `${day} ${monthName} ${year}`;
      }
      const d = new Date(dateStr);
      return isNaN(d) ? dateStr : `${d.getDate()} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sendWhatsAppReceipt = () => {
    if (!student?.parentPhone) return;
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `🧾 *FEE RECEIPT — ${institute?.name}*\n` +
      `--------------------------------\n` +
      `Receipt No: ${fee.receiptNo}\n` +
      `Student Name: ${student.name} (Roll #${student.rollNo})\n` +
      `Batch / Class: ${batch?.name || student.standard}\n` +
      `Month / Period: ${fee.monthFor}\n` +
      `Amount Paid: ${currency}${fee.amount}\n` +
      `Payment Date: ${formatDisplayDate(fee.date)}\n` +
      `Payment Mode: ${fee.paymentMode}\n` +
      `--------------------------------\n` +
      `Status: PAID (Thank you!)\n` +
      `${institute?.address ? institute.address + '\n' : ''}` +
      `Phone: ${institute?.phone || ''}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header no-print">
          <h3 className="card-title">Digital Fee Receipt</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print Receipt
            </button>
            {student?.parentPhone && (
              <button onClick={sendWhatsAppReceipt} className="btn btn-secondary btn-sm" style={{ color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)' }}>
                <MessageSquare size={14} /> Send WhatsApp
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="modal-body printable-receipt-area" style={{ background: '#ffffff', padding: '1rem 0' }}>
          <div style={{
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.75rem',
            background: '#ffffff',
            color: '#0f172a',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
          }}>
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
                {institute?.name}
              </h2>
              {institute?.tagline && (
                <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>
                  {institute.tagline}
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.35rem' }}>
                {institute?.address} • Phone: {institute?.phone}
              </div>
              <div style={{
                display: 'inline-block',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '0.25rem 0.85rem',
                borderRadius: '9999px',
                marginTop: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Official Payment Receipt
              </div>
            </div>

            {/* Meta Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem', color: '#0f172a' }}>
              <div>
                <span style={{ color: '#64748b' }}>Receipt No: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{fee.receiptNo}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b' }}>Date: </span>
                <strong style={{ color: '#0f172a' }}>{formatDisplayDate(fee.date)}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Student Name: </span>
                <strong style={{ color: '#0f172a' }}>{student?.name}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b' }}>Roll #: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{student?.rollNo}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Batch / Class: </span>
                <strong style={{ color: '#0f172a' }}>{batch?.name || student?.standard}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b' }}>Month For: </span>
                <strong style={{ color: '#0f172a' }}>{fee.monthFor}</strong>
              </div>
            </div>

            {/* Fee Breakdown Table */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.1rem',
              marginBottom: '1.25rem',
              color: '#0f172a'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#334155' }}>Tuition & Course Fee ({fee.monthFor})</span>
                <strong style={{ color: '#0f172a' }}>{currency}{Number(fee.amount).toLocaleString()}</strong>
              </div>
              {fee.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>Concession / Discount</span>
                  <span>- {currency}{Number(fee.discount).toLocaleString()}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid #cbd5e1',
                paddingTop: '0.75rem',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#16a34a'
              }}>
                <span>Total Amount Paid:</span>
                <span>{currency}{Number(fee.amount).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.45rem' }}>
                Payment Mode: <strong style={{ color: '#1e293b' }}>{fee.paymentMode}</strong> {fee.remarks ? `• (${fee.remarks})` : ''}
              </div>
            </div>

            {/* Footer / Signature Seal */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingTop: '1.25rem',
              fontSize: '0.8rem',
              color: '#475569'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: 700 }}>
                <CheckCircle size={16} /> Computer Generated Receipt
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', borderBottom: '1px solid #94a3b8', marginBottom: '0.25rem' }}></div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Authorized Signatory</span>
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
