import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Trash2,
  X,
  Search,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  Check
} from 'lucide-react';

export default function EnquiriesView({ db, onUpdateDB }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course: '',
    status: 'NEW',
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    const newEnquiry = {
      id: 'eq-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...formData
    };
    onUpdateDB({ ...db, enquiries: [newEnquiry, ...db.enquiries] });
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', course: '', status: 'NEW', followUpDate: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = db.enquiries.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq);
    onUpdateDB({ ...db, enquiries: updated });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this enquiry lead record?')) {
      onUpdateDB({ ...db, enquiries: db.enquiries.filter(eq => eq.id !== id) });
    }
  };

  const openWhatsApp = (phone, name, course) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello ${name}! Thank you for your interest regarding *${course || 'tuition classes'}* at *${db.instituteProfile?.name}*. How can we assist you with admissions?`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'LD';
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

  const filteredEnquiries = db.enquiries.filter(eq => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      eq.name.toLowerCase().includes(search) ||
      eq.course?.toLowerCase().includes(search) ||
      eq.phone?.includes(search) ||
      eq.notes?.toLowerCase().includes(search);
    const matchStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const totalLeads = db.enquiries.length;
  const followUpLeads = db.enquiries.filter(e => e.status === 'FOLLOW_UP' || e.status === 'NEW').length;
  const enrolledLeads = db.enquiries.filter(e => e.status === 'ENROLLED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return { label: 'New Lead', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'FOLLOW_UP':
        return { label: 'In Follow-up', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'ENROLLED':
        return { label: 'Enrolled 🎉', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'DROPPED':
        return { label: 'Dropped', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { label: status, bg: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: 'var(--border-color)' };
    }
  };

  return (
    <div>
      {/* Top Metrics Cards */}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Leads</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            {totalLeads}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Follow-ups</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.15rem' }}>
            {followUpLeads}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Enrolled 🎉</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
            {enrolledLeads}
          </div>
        </div>
      </div>

      {/* Search & Add Lead Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <div className="input-with-icon" style={{ width: '100%' }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Search leads by name, course, phone, notes..."
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
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', height: '42px', fontWeight: 700 }}
        >
          <Plus size={16} /> <span>Record New Admission Lead</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="chips-bar">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`chip-btn ${selectedStatus === 'ALL' ? 'active' : ''}`}
        >
          All ({db.enquiries.length})
        </button>
        <button
          onClick={() => setSelectedStatus('NEW')}
          className={`chip-btn ${selectedStatus === 'NEW' ? 'active' : ''}`}
        >
          New Leads
        </button>
        <button
          onClick={() => setSelectedStatus('FOLLOW_UP')}
          className={`chip-btn ${selectedStatus === 'FOLLOW_UP' ? 'active' : ''}`}
        >
          In Follow-up
        </button>
        <button
          onClick={() => setSelectedStatus('ENROLLED')}
          className={`chip-btn ${selectedStatus === 'ENROLLED' ? 'active' : ''}`}
        >
          Enrolled 🎉
        </button>
        <button
          onClick={() => setSelectedStatus('DROPPED')}
          className={`chip-btn ${selectedStatus === 'DROPPED' ? 'active' : ''}`}
        >
          Dropped
        </button>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-list-container mobile-card-only">
        {filteredEnquiries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            No admission leads found matching your search.
          </div>
        ) : (
          filteredEnquiries.map(eq => {
            const badge = getStatusBadge(eq.status);
            return (
              <div
                key={eq.id}
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
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div className="student-avatar-circle" style={{ width: '42px', height: '42px', fontSize: '0.9rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.35))', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}>
                      {getInitials(eq.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {eq.name}
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Interested: <strong style={{ color: 'var(--text-secondary)' }}>{eq.course || 'General'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    className="select"
                    style={{
                      padding: '0.3rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      width: 'auto',
                      background: badge.bg,
                      color: badge.color,
                      borderColor: badge.border,
                      borderRadius: 'var(--radius-full)',
                      minHeight: '28px',
                      cursor: 'pointer'
                    }}
                    value={eq.status}
                    onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                  >
                    <option value="NEW">New Lead</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="ENROLLED">Enrolled 🎉</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>

                {/* Notes & Follow-up Row */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={13} color="var(--text-muted)" />
                      <span>{eq.phone}</span>
                    </div>
                    <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      <Clock size={12} />
                      <span>Follow-up: {formatDisplayDate(eq.followUpDate)}</span>
                    </div>
                  </div>
                  {eq.notes && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.35rem', marginTop: '0.1rem' }}>
                      "{eq.notes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                  {eq.phone && (
                    <button
                      onClick={() => openWhatsApp(eq.phone, eq.name, eq.course)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)', flex: 1, justifyContent: 'center' }}
                    >
                      <MessageSquare size={14} /> WhatsApp Lead
                    </button>
                  )}

                  {eq.status !== 'ENROLLED' && (
                    <button
                      onClick={() => handleStatusChange(eq.id, 'ENROLLED')}
                      className="btn btn-success btn-sm"
                      title="Mark as Enrolled"
                    >
                      <Check size={14} /> Enroll
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(eq.id)}
                    className="btn btn-danger btn-icon btn-sm"
                    title="Delete Lead"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="table-container desktop-table-only">
        <table className="table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Course / Standard</th>
              <th>Phone</th>
              <th>Next Follow-up</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No leads found.
                </td>
              </tr>
            ) : (
              filteredEnquiries.map(eq => (
                <tr key={eq.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{eq.name}</div>
                    {eq.notes && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>"{eq.notes}"</div>}
                  </td>
                  <td>{eq.course || 'General'}</td>
                  <td>{eq.phone}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 600 }}>
                      <Calendar size={13} /> {formatDisplayDate(eq.followUpDate)}
                    </div>
                  </td>
                  <td>
                    <select
                      className="select"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                      value={eq.status}
                      onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                    >
                      <option value="NEW">New Lead</option>
                      <option value="FOLLOW_UP">In Follow-up</option>
                      <option value="ENROLLED">Enrolled 🎉</option>
                      <option value="DROPPED">Dropped</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => openWhatsApp(eq.phone, eq.name, eq.course)}
                        className="btn btn-secondary btn-icon btn-sm"
                        style={{ color: '#16a34a' }}
                      >
                        <MessageSquare size={13} />
                      </button>
                      <button onClick={() => handleDelete(eq.id)} className="btn btn-danger btn-icon btn-sm">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <HelpCircle size={18} color="var(--primary)" />
                Record New Admission Lead
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Student / Parent Name *</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ishaan Malhotra"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lead Status</label>
                    <select
                      className="select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="NEW">New Lead</option>
                      <option value="FOLLOW_UP">In Follow-up</option>
                      <option value="ENROLLED">Enrolled 🎉</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course of Interest</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      placeholder="e.g. Class 10 Maths & Science"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inquiry Notes / Requirements</label>
                  <textarea
                    rows={2}
                    className="textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Inquired about evening batches and fee discounts"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Admission Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
