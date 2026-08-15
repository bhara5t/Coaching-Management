import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Phone,
  Edit2,
  Trash2,
  X,
  IndianRupee,
  Search,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Sparkles,
  Users
} from 'lucide-react';

export default function StaffView({ db, onUpdateDB }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const currency = db.instituteProfile?.currency || '₹';

  const [formData, setFormData] = useState({
    name: '',
    role: 'Faculty',
    subject: 'Mathematics',
    phone: '',
    salary: 25000,
    salaryType: 'Monthly',
    status: 'ACTIVE',
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({ name: '', role: 'Faculty', subject: 'Mathematics', phone: '', salary: 25000, salaryType: 'Monthly', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({ ...staff });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStaff) {
      const updated = db.staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s);
      onUpdateDB({ ...db, staff: updated });
    } else {
      const newStaff = {
        id: 'st-' + Date.now(),
        ...formData
      };
      onUpdateDB({ ...db, staff: [...db.staff, newStaff] });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this staff record?')) {
      onUpdateDB({ ...db, staff: db.staff.filter(s => s.id !== id) });
    }
  };

  const filteredStaff = db.staff.filter(s => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(search) ||
      s.role?.toLowerCase().includes(search) ||
      s.subject?.toLowerCase().includes(search) ||
      s.phone?.includes(search);
    const matchRole = selectedRole === 'ALL' || s.role?.toLowerCase() === selectedRole.toLowerCase();
    return matchSearch && matchRole;
  });

  const totalStaffCount = db.staff.length;
  const activeFacultyCount = db.staff.filter(s => s.status === 'ACTIVE' && s.role === 'Faculty').length;
  const totalMonthlyPayroll = db.staff
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + Number(s.salary || 0), 0);

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'TC';
  };

  const openWhatsApp = (phone, name) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hello ${name}! Message from ${db.instituteProfile?.name}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Staff</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            {totalStaffCount}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Active Faculty</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.15rem' }}>
            {activeFacultyCount}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Monthly Payroll</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
            {currency}{totalMonthlyPayroll.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Add Staff Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.85rem' }}>
        <div className="input-with-icon" style={{ width: '100%' }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Search staff by name, subject, role, phone..."
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
          <UserPlus size={16} /> <span>Add Faculty / Staff Member</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="chips-bar">
        <button
          onClick={() => setSelectedRole('ALL')}
          className={`chip-btn ${selectedRole === 'ALL' ? 'active' : ''}`}
        >
          All ({db.staff.length})
        </button>
        <button
          onClick={() => setSelectedRole('Faculty')}
          className={`chip-btn ${selectedRole === 'Faculty' ? 'active' : ''}`}
        >
          Faculty
        </button>
        <button
          onClick={() => setSelectedRole('Administration')}
          className={`chip-btn ${selectedRole === 'Administration' ? 'active' : ''}`}
        >
          Administration
        </button>
        <button
          onClick={() => setSelectedRole('Assistant')}
          className={`chip-btn ${selectedRole === 'Assistant' ? 'active' : ''}`}
        >
          Assistant
        </button>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-list-container mobile-card-only">
        {filteredStaff.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            No staff records found matching your criteria.
          </div>
        ) : (
          filteredStaff.map(member => (
            <div
              key={member.id}
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
                  <div className="student-avatar-circle" style={{ width: '42px', height: '42px', fontSize: '0.9rem', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.35))', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.4)' }}>
                    {getInitials(member.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <h4 style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.name}
                      </h4>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {member.role} {member.subject ? `• ${member.subject}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {currency}{Number(member.salary).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    /{member.salaryType || 'Monthly'}
                  </span>
                </div>
              </div>

              {/* Info Row */}
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
                  <span>{member.phone || 'No phone recorded'}</span>
                </div>
                <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                  {member.status}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                {member.phone && (
                  <button
                    onClick={() => openWhatsApp(member.phone, member.name)}
                    className="btn btn-secondary btn-icon btn-sm"
                    style={{ color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)' }}
                    title="WhatsApp Staff"
                  >
                    <MessageSquare size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="btn btn-danger btn-icon btn-sm"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-table-only">
        <table className="table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Role</th>
              <th>Subject Specialization</th>
              <th>Phone</th>
              <th>Salary Structure</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No staff members found.
                </td>
              </tr>
            ) : (
              filteredStaff.map(member => (
                <tr key={member.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</td>
                  <td><span className="badge badge-primary">{member.role}</span></td>
                  <td>{member.subject || '—'}</td>
                  <td>{member.phone || '—'}</td>
                  <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currency}{Number(member.salary).toLocaleString()} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/{member.salaryType}</span>
                  </td>
                  <td>
                    <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      {member.phone && (
                        <button
                          onClick={() => openWhatsApp(member.phone, member.name)}
                          className="btn btn-secondary btn-icon btn-sm"
                          style={{ color: '#16a34a' }}
                        >
                          <MessageSquare size={13} />
                        </button>
                      )}
                      <button onClick={() => handleOpenEdit(member)} className="btn btn-secondary btn-icon btn-sm">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="btn btn-danger btn-icon btn-sm">
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

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <UserPlus size={18} color="var(--primary)" />
                {editingStaff ? 'Edit Staff Member' : 'Add New Faculty / Staff'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Verma"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Faculty">Faculty / Teacher</option>
                      <option value="Administration">Administration</option>
                      <option value="Assistant">Teaching Assistant</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Subject / Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      className="input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Salary Amount ({currency})</label>
                    <input
                      type="number"
                      required
                      className="input"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Salary Type</label>
                    <select
                      className="select"
                      value={formData.salaryType}
                      onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                    >
                      <option value="Monthly">Monthly Fixed</option>
                      <option value="Per Hour">Hourly Rate</option>
                      <option value="Per Batch">Per Batch</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active Staff</option>
                    <option value="INACTIVE">Inactive / On Leave</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Save Changes' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
