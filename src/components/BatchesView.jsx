import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Clock,
  Users,
  IndianRupee,
  Edit2,
  Trash2,
  X,
  Search,
  BookOpen,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function BatchesView({ db, onUpdateDB, onSelectBatch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const currency = db.instituteProfile?.currency || '₹';

  const [formData, setFormData] = useState({
    name: '',
    timing: '',
    subject: '',
    defaultFee: 1500,
  });

  const handleOpenAdd = () => {
    setEditingBatch(null);
    setFormData({ name: '', timing: '05:00 PM - 06:30 PM', subject: 'Mathematics', defaultFee: 1500 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({ ...batch });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingBatch) {
      const updated = db.batches.map(b => b.id === editingBatch.id ? { ...b, ...formData } : b);
      onUpdateDB({ ...db, batches: updated });
    } else {
      const newBatch = {
        id: 'b-' + Date.now(),
        ...formData
      };
      onUpdateDB({ ...db, batches: [...db.batches, newBatch] });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    const studentCount = db.students.filter(s => s.batchId === id && s.status === 'ACTIVE').length;
    if (studentCount > 0) {
      alert(`Cannot delete batch with ${studentCount} active students. Please reassign students first.`);
      return;
    }
    if (window.confirm('Are you sure you want to delete this batch?')) {
      onUpdateDB({ ...db, batches: db.batches.filter(b => b.id !== id) });
    }
  };

  const filteredBatches = db.batches.filter(b => {
    const search = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(search) ||
      b.subject?.toLowerCase().includes(search) ||
      b.timing?.toLowerCase().includes(search)
    );
  });

  // Calculate totals
  const totalStudentsEnrolled = db.students.filter(s => s.status === 'ACTIVE').length;
  const totalPotentialRevenue = db.batches.reduce((sum, b) => {
    const count = db.students.filter(s => s.batchId === b.id && s.status === 'ACTIVE').length;
    return sum + (count * Number(b.defaultFee || 0));
  }, 0);

  const getSubjectBadgeStyle = (subject) => {
    const sub = (subject || '').toLowerCase();
    if (sub.includes('math')) return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
    if (sub.includes('physic') || sub.includes('science')) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    if (sub.includes('chem')) return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    return { bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' };
  };

  return (
    <div>
      {/* Top Overview Cards */}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total Batches</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
            {db.batches.length}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Enrolled Students</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.15rem' }}>
            {totalStudentsEnrolled}
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
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Monthly Revenue</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
            {currency}{totalPotentialRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Add Batch Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        <div className="input-with-icon" style={{ width: '100%' }}>
          <Search className="input-icon" size={16} />
          <input
            type="text"
            placeholder="Search batches by name, subject, timing..."
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
          <Plus size={16} /> <span>Create New Class Batch</span>
        </button>
      </div>

      {/* Batch Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredBatches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            No batches found matching your search.
          </div>
        ) : (
          filteredBatches.map(batch => {
            const students = db.students.filter(s => s.batchId === batch.id && s.status === 'ACTIVE');
            const badgeStyle = getSubjectBadgeStyle(batch.subject);
            const batchMonthlyRevenue = students.length * Number(batch.defaultFee || 0);

            return (
              <div
                key={batch.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.05rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`
                        }}
                      >
                        {batch.subject || 'General'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {batch.name}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleOpenEdit(batch)}
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Edit Batch"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(batch.id)}
                      className="btn btn-danger btn-icon btn-sm"
                      title="Delete Batch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Timing & Fee Stats */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.75rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.6rem',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {batch.timing || 'Flexible'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                    <Users size={14} color="var(--primary)" />
                    <span><strong>{students.length}</strong> Students</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                    <IndianRupee size={14} color="var(--success)" />
                    <span>Fee: <strong>{currency}{batch.defaultFee}</strong>/mo</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
                    <TrendingUp size={14} color="#38bdf8" />
                    <span>Total: <strong>{currency}{batchMonthlyRevenue.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                  <button
                    onClick={() => onSelectBatch(batch.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', color: '#60a5fa', fontWeight: 700 }}
                  >
                    <Users size={14} /> View {students.length} Enrolled Students
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Batch Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <Layers size={18} color="var(--primary)" />
                {editingBatch ? 'Edit Batch Details' : 'Create New Class Batch'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Batch Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Class 10 - Mathematics (Morning)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Monthly Fee ({currency})</label>
                    <input
                      type="number"
                      required
                      className="input"
                      value={formData.defaultFee}
                      onChange={(e) => setFormData({ ...formData, defaultFee: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Class Timing & Schedule</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    placeholder="e.g. 05:00 PM - 06:30 PM (Mon, Wed, Fri)"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBatch ? 'Save Changes' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
