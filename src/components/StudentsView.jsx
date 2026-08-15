import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  IdCard,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  User,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  MoreVertical,
  Check
} from 'lucide-react';

export default function StudentsView({ db, onUpdateDB, onSelectStudentForIdCard, onSelectStudentForFee }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('OVERVIEW');

  const currency = db.instituteProfile?.currency || '₹';
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    standard: 'Class 10',
    batchId: db.batches[0]?.id || '',
    phone: '',
    parentPhone: '',
    monthlyFee: 1500,
    address: '',
    status: 'ACTIVE',
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNo: String(db.students.length + 101),
      standard: 'Class 10',
      batchId: db.batches[0]?.id || '',
      phone: '',
      parentPhone: '',
      monthlyFee: db.batches[0]?.defaultFee || 1500,
      address: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      const updated = db.students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s);
      onUpdateDB({ ...db, students: updated });
    } else {
      const newStudent = {
        id: 's-' + Date.now(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
      };
      onUpdateDB({ ...db, students: [...db.students, newStudent] });
    }
    setIsModalOpen(false);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student? All attendance and fee records will be preserved.')) {
      const updated = db.students.filter(s => s.id !== id);
      onUpdateDB({ ...db, students: updated });
      if (detailStudent?.id === id) setDetailStudent(null);
    }
  };

  const filteredStudents = db.students.filter(s => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(search) ||
      s.rollNo?.toLowerCase().includes(search) ||
      s.parentPhone?.includes(search) ||
      s.standard?.toLowerCase().includes(search);
    const matchBatch = selectedBatch === 'ALL' || s.batchId === selectedBatch;
    return matchSearch && matchBatch;
  });

  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello! Update regarding *${name}* from *${db.instituteProfile?.name}*.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'ST';
  };

  const hasPaidCurrentMonth = (studentId) => {
    return db.fees.some(f => f.studentId === studentId && f.monthFor === currentMonthName);
  };

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

  return (
    <div>
      {/* Search & Action Vertical Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <div className="input-with-icon" style={{ width: '100%' }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Search by name, roll #, phone..."
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
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontWeight: 700 }}
        >
          <UserPlus size={16} /> <span>Add New Student</span>
        </button>
      </div>

      {/* Horizontal Batch Filter Chips */}
      <div className="chips-bar">
        <button
          onClick={() => setSelectedBatch('ALL')}
          className={`chip-btn ${selectedBatch === 'ALL' ? 'active' : ''}`}
        >
          All ({db.students.length})
        </button>
        {db.batches.map(b => {
          const count = db.students.filter(s => s.batchId === b.id).length;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBatch(b.id)}
              className={`chip-btn ${selectedBatch === b.id ? 'active' : ''}`}
            >
              {b.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Mobile Student Cards */}
      <div className="mobile-list-container mobile-card-only">
        {filteredStudents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            No students found matching your criteria.
          </div>
        ) : (
          filteredStudents.map(student => {
            const batch = db.batches.find(b => b.id === student.batchId);
            const isFeePaid = hasPaidCurrentMonth(student.id);

            return (
              <div
                key={student.id}
                className="mobile-item-card"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Top Section */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div className="student-avatar-circle" style={{ width: '42px', height: '42px', fontSize: '0.9rem' }}>
                      {getInitials(student.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          #{student.rollNo}
                        </span>
                        <h4 style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {student.name}
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {batch?.name || 'Unassigned'} • {student.standard}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {currency}{student.monthlyFee}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: isFeePaid ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>
                      {isFeePaid ? 'Fee Paid' : 'Fee Pending'}
                    </span>
                  </div>
                </div>

                {/* Info & Phone Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={13} color="var(--text-muted)" />
                    <span>{student.parentPhone || student.phone || 'No phone recorded'}</span>
                  </div>
                  <span className={`badge ${student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                    {student.status}
                  </span>
                </div>

                {/* Bottom Quick Action Grid */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', paddingTop: '0.15rem' }}>
                  {student.parentPhone && (
                    <button
                      onClick={() => openWhatsApp(student.parentPhone, student.name)}
                      className="btn btn-secondary btn-icon btn-sm"
                      style={{ color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)' }}
                      title="WhatsApp Parent"
                    >
                      <MessageSquare size={15} />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectStudentForFee(student)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, color: 'var(--primary)', fontWeight: 700 }}
                  >
                    <CreditCard size={14} /> Collect Fee
                  </button>

                  <button
                    onClick={() => {
                      setDetailStudent(student);
                      setActiveDetailTab('OVERVIEW');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Eye size={14} /> Profile
                  </button>

                  <button
                    onClick={() => handleOpenEdit(student)}
                    className="btn btn-secondary btn-icon btn-sm"
                    title="Edit Student"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="btn btn-danger btn-icon btn-sm"
                    title="Delete Student"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table View */}
      <div className="table-container desktop-table-only">
        <table className="table">
          <thead>
            <tr>
              <th>Roll #</th>
              <th>Student Name</th>
              <th>Batch / Standard</th>
              <th>Parent Phone</th>
              <th>Monthly Fee</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => {
                const batch = db.batches.find(b => b.id === student.batchId);
                return (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)' }}>
                      #{student.rollNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Joined {formatDisplayDate(student.joinDate)}</div>
                    </td>
                    <td>
                      <div>{batch?.name || 'Unassigned'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.standard}</div>
                    </td>
                    <td>
                      {student.parentPhone ? (
                        <button
                          onClick={() => openWhatsApp(student.parentPhone, student.name)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#16a34a', border: 'none', background: 'transparent', padding: 0 }}
                        >
                          <MessageSquare size={13} /> {student.parentPhone}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 800 }}>{currency}{student.monthlyFee}</td>
                    <td>
                      <span className={`badge ${student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          onClick={() => onSelectStudentForFee(student)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--primary)', fontWeight: 700 }}
                        >
                          Fee
                        </button>
                        <button
                          onClick={() => {
                            setDetailStudent(student);
                            setActiveDetailTab('OVERVIEW');
                          }}
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Profile"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onSelectStudentForIdCard(student)}
                          className="btn btn-secondary btn-icon btn-sm"
                          title="ID Card"
                        >
                          <IdCard size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="btn btn-danger btn-icon btn-sm"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <UserPlus size={18} color="var(--primary)" />
                {editingStudent ? 'Edit Student Details' : 'Enroll New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveStudent}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Standard / Grade</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Class 10"
                      value={formData.standard}
                      onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign Batch</label>
                    <select
                      className="select"
                      value={formData.batchId}
                      onChange={(e) => {
                        const batch = db.batches.find(b => b.id === e.target.value);
                        setFormData({
                          ...formData,
                          batchId: e.target.value,
                          monthlyFee: batch?.defaultFee || formData.monthlyFee
                        });
                      }}
                    >
                      {db.batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Parent WhatsApp Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="input"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Tuition Fee ({currency})</label>
                    <input
                      type="number"
                      required
                      className="input"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Student Status</label>
                  <select
                    className="select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active (Currently Attending)</option>
                    <option value="INACTIVE">Inactive (On Leave / Dropped)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile & History Modal */}
      {detailStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="student-avatar-circle" style={{ width: '38px', height: '38px', fontSize: '0.85rem' }}>
                  {getInitials(detailStudent.name)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {detailStudent.name}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Roll #{detailStudent.rollNo} • {detailStudent.standard}
                  </p>
                </div>
              </div>
              <button onClick={() => setDetailStudent(null)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            {/* Profile Sub Tabs */}
            <div style={{ padding: '0.75rem 1.25rem 0 1.25rem' }}>
              <div className="segmented-control" style={{ marginBottom: '0.75rem' }}>
                <button
                  onClick={() => setActiveDetailTab('OVERVIEW')}
                  className={`segmented-btn ${activeDetailTab === 'OVERVIEW' ? 'active' : ''}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveDetailTab('FEES')}
                  className={`segmented-btn ${activeDetailTab === 'FEES' ? 'active' : ''}`}
                >
                  Fee Ledger
                </button>
                <button
                  onClick={() => setActiveDetailTab('ATTENDANCE')}
                  className={`segmented-btn ${activeDetailTab === 'ATTENDANCE' ? 'active' : ''}`}
                >
                  Attendance
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ paddingTop: '0.5rem' }}>
              {activeDetailTab === 'OVERVIEW' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Batch</div>
                        <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>
                          {db.batches.find(b => b.id === detailStudent.batchId)?.name || 'Unassigned'}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Monthly Fee</div>
                        <div style={{ fontWeight: 800, color: 'var(--success)', marginTop: '0.1rem' }}>
                          {currency}{detailStudent.monthlyFee}/month
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Parent WhatsApp</div>
                        <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>
                          {detailStudent.parentPhone || '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Enrolled On</div>
                        <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>
                          {formatDisplayDate(detailStudent.joinDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectStudentForIdCard(detailStudent);
                      setDetailStudent(null);
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <IdCard size={15} /> View & Print Digital Student ID
                  </button>
                </div>
              )}

              {activeDetailTab === 'FEES' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Payment History
                    </span>
                    <button
                      onClick={() => {
                        onSelectStudentForFee(detailStudent);
                        setDetailStudent(null);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <CreditCard size={13} /> Collect Fee
                    </button>
                  </div>

                  {db.fees.filter(f => f.studentId === detailStudent.id).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.825rem' }}>
                      No payment records found for this student.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {db.fees
                        .filter(f => f.studentId === detailStudent.id)
                        .map(fee => (
                          <div
                            key={fee.id}
                            style={{
                              padding: '0.75rem 0.85rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{fee.monthFor}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fee.receiptNo} • {formatDisplayDate(fee.date)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: 'var(--success)' }}>{currency}{fee.amount}</div>
                              <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>{fee.paymentMode}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {activeDetailTab === 'ATTENDANCE' && (
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.65rem' }}>
                    Recent Attendance Logs
                  </span>

                  {db.attendance.filter(a => a.studentId === detailStudent.id).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.825rem' }}>
                      No attendance marked yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {db.attendance
                        .filter(a => a.studentId === detailStudent.id)
                        .slice(0, 10)
                        .map(att => (
                          <div
                            key={att.id}
                            style={{
                              padding: '0.65rem 0.85rem',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                              {formatDisplayDate(att.date)}
                            </div>
                            <span className={`badge ${att.status === 'PRESENT' ? 'badge-success' : att.status === 'ABSENT' ? 'badge-danger' : 'badge-warning'}`}>
                              {att.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setDetailStudent(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
