import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Printer,
  Send,
  MessageSquare,
  AlertCircle,
  FileText,
  X,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

export default function FeesView({ db, onUpdateDB, onOpenReceipt, preselectedStudent }) {
  const currency = db.instituteProfile?.currency || '₹';
  const today = new Date().toISOString().split('T')[0];

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

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('LEDGER');
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: preselectedStudent?.id || db.students[0]?.id || '',
    amount: preselectedStudent?.monthlyFee || db.students[0]?.monthlyFee || 1500,
    discount: 0,
    monthFor: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    date: today,
    paymentMode: 'UPI',
    remarks: 'Monthly Tuition Fee',
  });

  const handleOpenCollect = (student = null) => {
    const targetStudent = student || preselectedStudent || db.students[0];
    setFormData({
      studentId: targetStudent?.id || '',
      amount: targetStudent?.monthlyFee || 1500,
      discount: 0,
      monthFor: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      date: today,
      paymentMode: 'UPI',
      remarks: 'Monthly Tuition Fee',
    });
    setIsCollectModalOpen(true);
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) return;

    const receiptNum = (db.instituteProfile?.receiptPrefix || 'REC-2026-') + String(db.fees.length + 1).padStart(3, '0');
    const newFeeRecord = {
      id: 'f-' + Date.now(),
      receiptNo: receiptNum,
      ...formData,
    };

    onUpdateDB({ ...db, fees: [newFeeRecord, ...db.fees] });
    setIsCollectModalOpen(false);
    onOpenReceipt(newFeeRecord);
  };

  const filteredFees = db.fees.filter(f => {
    const student = db.students.find(s => s.id === f.studentId);
    const search = searchTerm.toLowerCase();
    return (
      f.receiptNo.toLowerCase().includes(search) ||
      student?.name.toLowerCase().includes(search) ||
      f.monthFor.toLowerCase().includes(search) ||
      f.paymentMode.toLowerCase().includes(search)
    );
  });

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const pendingStudents = db.students.filter(s => {
    if (s.status !== 'ACTIVE') return false;
    const hasPaidCurrentMonth = db.fees.some(
      f => f.studentId === s.id && f.monthFor === currentMonthName
    );
    return !hasPaidCurrentMonth;
  });

  const filteredPendingStudents = pendingStudents.filter(s => {
    const search = searchTerm.toLowerCase();
    const batch = db.batches.find(b => b.id === s.batchId);
    return (
      s.name.toLowerCase().includes(search) ||
      s.rollNo?.toLowerCase().includes(search) ||
      batch?.name.toLowerCase().includes(search) ||
      s.parentPhone?.includes(search)
    );
  });

  // Calculate high-level financial stats
  const totalCollectedCurrentMonth = db.fees
    .filter(f => f.monthFor === currentMonthName)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalPendingAmount = pendingStudents.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  const sendFeeReminder = (student) => {
    if (!student.parentPhone) return;
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Dear Parent, friendly reminder that tuition fee of *${currency}${student.monthlyFee}* for the month of *${currentMonthName}* is pending for *${student.name}* (Roll #${student.rollNo}).\n\nPlease remit at your earliest convenience.\n\nThank you,\n*${db.instituteProfile?.name}*`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'ST';
  };

  return (
    <div>
      {/* Top Financial Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.65rem',
        marginBottom: '0.85rem'
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Collected ({currentMonthName.split(' ')[0]})</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
            {currency}{totalCollectedCurrentMonth.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Pending Dues</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.15rem' }}>
            {currency}{totalPendingAmount.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Receipts</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.15rem' }}>
            {db.fees.length}
          </div>
        </div>
      </div>

      {/* Segmented Switcher */}
      <div className="segmented-control" style={{ marginBottom: '0.85rem' }}>
        <button
          onClick={() => setActiveSubTab('LEDGER')}
          className={`segmented-btn ${activeSubTab === 'LEDGER' ? 'active' : ''}`}
        >
          Payment Ledger ({db.fees.length})
        </button>
        <button
          onClick={() => setActiveSubTab('DUES')}
          className={`segmented-btn ${activeSubTab === 'DUES' ? 'active' : ''}`}
        >
          Pending Dues ({pendingStudents.length})
        </button>
      </div>

      {/* Search & Collect Action Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <div className="input-with-icon" style={{ width: '100%' }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder={activeSubTab === 'LEDGER' ? "Search receipts, student name..." : "Search pending students by name, batch..."}
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => handleOpenCollect()}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontWeight: 700 }}
        >
          <PlusCircle size={16} /> <span>Collect Fee Payment</span>
        </button>
      </div>

      {/* LEDGER TAB */}
      {activeSubTab === 'LEDGER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredFees.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              No fee payment records found.
            </div>
          ) : (
            filteredFees.map(fee => {
              const student = db.students.find(s => s.id === fee.studentId);
              return (
                <div
                  key={fee.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.95rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div className="student-avatar-circle" style={{ width: '38px', height: '38px', fontSize: '0.85rem' }}>
                        {getInitials(student?.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student?.name || 'Unknown'}
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{fee.receiptNo}</span> • {fee.monthFor}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.05rem' }}>
                        {currency}{Number(fee.amount).toLocaleString()}
                      </div>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        {fee.paymentMode}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.55rem',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Paid on {formatDisplayDate(fee.date)}
                    </span>

                    <button
                      onClick={() => onOpenReceipt(fee)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#60a5fa', fontWeight: 700 }}
                    >
                      <FileText size={13} /> View Receipt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DUES TAB */}
      {activeSubTab === 'DUES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredPendingStudents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#34d399' }}>
              <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontWeight: 700 }}>All fees collected! No pending dues.</div>
            </div>
          ) : (
            filteredPendingStudents.map(student => {
              const batch = db.batches.find(b => b.id === student.batchId);
              return (
                <div
                  key={student.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.95rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div className="student-avatar-circle" style={{ width: '38px', height: '38px', fontSize: '0.85rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.35))', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
                        {getInitials(student.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.name}
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Roll #{student.rollNo} • {batch?.name || 'Class'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.05rem' }}>
                        {currency}{Number(student.monthlyFee).toLocaleString()}
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        PENDING
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.45rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.55rem'
                  }}>
                    {student.parentPhone && (
                      <button
                        onClick={() => sendFeeReminder(student)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)' }}
                      >
                        <MessageSquare size={13} /> Send Reminder
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenCollect(student)}
                      className="btn btn-primary btn-sm"
                      style={{ fontWeight: 700 }}
                    >
                      <CreditCard size={13} /> Collect Now
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Collect Fee Modal */}
      {isCollectModalOpen && (() => {
        const selectedStudentObj = db.students.find(s => s.id === formData.studentId);
        const selectedStudentBatch = db.batches.find(b => b.id === selectedStudentObj?.batchId);

        return (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '480px' }}>
              <div className="modal-header">
                <h3 className="card-title">
                  <CreditCard size={18} color="var(--primary)" />
                  Collect Fee Payment
                </h3>
                <button onClick={() => setIsCollectModalOpen(false)} className="btn btn-secondary btn-icon btn-sm">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveFee}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  
                  {/* Student Selector */}
                  <div className="form-group">
                    <label className="form-label">Select Enrolled Student *</label>
                    <select
                      className="select"
                      required
                      value={formData.studentId}
                      onChange={(e) => {
                        const selected = db.students.find(s => s.id === e.target.value);
                        setFormData({
                          ...formData,
                          studentId: e.target.value,
                          amount: selected?.monthlyFee || formData.amount
                        });
                      }}
                    >
                      {db.students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Roll #{s.rollNo}) — {currency}{s.monthlyFee}/mo
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Student Preview Card */}
                  {selectedStudentObj && (
                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.65rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <div className="student-avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                          {getInitials(selectedStudentObj.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {selectedStudentObj.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Roll #{selectedStudentObj.rollNo} • {selectedStudentBatch?.name || selectedStudentObj.standard}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Monthly Fee</span>
                        <div style={{ fontWeight: 800, color: '#60a5fa', fontSize: '0.95rem' }}>
                          {currency}{selectedStudentObj.monthlyFee}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amount Paid Field with Quick Chips */}
                  <div className="form-group">
                    <label className="form-label">Amount Paid ({currency}) *</label>
                    <input
                      type="number"
                      required
                      className="input"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      style={{ fontSize: '1.1rem', fontWeight: 800 }}
                    />
                    {selectedStudentObj && (
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: Number(selectedStudentObj.monthlyFee) })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        >
                          Full ({currency}{selectedStudentObj.monthlyFee})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: Math.round(Number(selectedStudentObj.monthlyFee) / 2) })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        >
                          Half ({currency}{Math.round(Number(selectedStudentObj.monthlyFee) / 2)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, amount: Number(selectedStudentObj.monthlyFee) * 2 })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        >
                          2 Months ({currency}{Number(selectedStudentObj.monthlyFee) * 2})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment Mode Selector Buttons */}
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                      {['UPI', 'Cash', 'Bank Transfer', 'Cheque'].map(mode => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setFormData({ ...formData, paymentMode: mode })}
                          className={`btn btn-sm ${formData.paymentMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            justifyContent: 'center',
                            padding: '0.45rem 0.2rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {mode === 'UPI' ? '⚡ UPI' : mode === 'Cash' ? '💵 Cash' : mode === 'Bank Transfer' ? '🏦 Bank' : '📝 Cheque'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Month For */}
                  <div className="form-group">
                    <label className="form-label">Fee Month / Period *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.monthFor}
                      onChange={(e) => setFormData({ ...formData, monthFor: e.target.value })}
                    />
                  </div>

                  {/* Payment Date */}
                  <div className="form-group">
                    <label className="form-label">Payment Date *</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  {/* Remarks */}
                  <div className="form-group">
                    <label className="form-label">Remarks / Transaction Note</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="e.g. Monthly Tuition Fee / Google Pay Ref"
                    />
                  </div>

                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                  <button type="button" onClick={() => setIsCollectModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ fontWeight: 800, flex: 1, justifyContent: 'center', height: '42px' }}
                  >
                    <CheckCircle2 size={17} /> Collect & Generate Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
