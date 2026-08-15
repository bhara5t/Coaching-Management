import React from 'react';
import {
  Users,
  Layers,
  CalendarCheck,
  IndianRupee,
  UserPlus,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard({ db, setActiveTab, onOpenCollectFee, onOpenAddStudent }) {
  const currency = db.instituteProfile?.currency || '₹';
  const today = new Date().toISOString().split('T')[0];

  const totalStudents = db.students.filter(s => s.status === 'ACTIVE').length;
  const totalBatches = db.batches.length;
  
  const todayAttendance = db.attendance.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = todayAttendance.filter(a => a.status === 'ABSENT').length;
  const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;

  const currentMonthPrefix = today.substring(0, 7);
  const currentMonthFees = db.fees
    .filter(f => f.date.startsWith(currentMonthPrefix))
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpectedMonthly = db.students
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  const collectionPercent = totalExpectedMonthly > 0 ? Math.min(100, Math.round((currentMonthFees / totalExpectedMonthly) * 100)) : 0;
  const recentFees = [...db.fees].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

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
      {/* Modern Hero Revenue & Quick Action Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '1.35rem 1.4rem',
        marginBottom: '1rem',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Ambient Background Light */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(37,99,235,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <TrendingUp size={13} color="#38bdf8" />
              <span>{new Date().toLocaleString('en-US', { month: 'long' })} Collections</span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.2rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              {currency}{currentMonthFees.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem 0.65rem',
            fontSize: '0.72rem',
            color: '#e2e8f0',
            fontWeight: 600
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>

        {/* Quick Action Pill Buttons */}
        <div className="banner-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onOpenAddStudent}
            className="btn"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              flex: 1,
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              border: 'none'
            }}
          >
            <UserPlus size={15} /> Add Student
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flex: 1,
              fontWeight: 600,
              backdropFilter: 'blur(8px)'
            }}
          >
            <CalendarCheck size={15} /> Attendance
          </button>
        </div>
      </div>

      {/* 2x2 Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Active Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Layers size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="stat-value">{totalBatches}</div>
            <div className="stat-label">Class Batches</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CalendarCheck size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">{presentCount}P / {absentCount}A Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
            <IndianRupee size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="stat-value">{currency}{currentMonthFees.toLocaleString()}</div>
            <div className="stat-label">Fees Collected</div>
          </div>
        </div>
      </div>

      {/* Batches Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Layers size={17} color="var(--primary)" />
            Running Batches
          </h3>
          <button onClick={() => setActiveTab('batches')} className="btn btn-secondary btn-sm">
            View All <ArrowRight size={13} />
          </button>
        </div>
        {db.batches.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>
            No class batches created yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {db.batches.map(batch => {
              const batchStudents = db.students.filter(s => s.batchId === batch.id && s.status === 'ACTIVE');
              return (
                <div
                  key={batch.id}
                  onClick={() => setActiveTab('batches')}
                  style={{
                    padding: '0.8rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {batch.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                      <Clock size={12} /> {batch.timing}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="badge badge-primary">{batchStudents.length} Students</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Collections */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <CreditCard size={17} color="var(--success)" />
            Recent Fee Collections
          </h3>
          <button onClick={() => setActiveTab('fees')} className="btn btn-secondary btn-sm">
            Ledger <ArrowRight size={13} />
          </button>
        </div>

        {recentFees.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0', fontSize: '0.85rem' }}>
            No fee records found.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {recentFees.map(fee => {
              const student = db.students.find(s => s.id === fee.studentId);
              return (
                <div
                  key={fee.id}
                  onClick={() => setActiveTab('fees')}
                  style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {student?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {formatDisplayDate(fee.date)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.95rem' }}>
                      {currency}{fee.amount}
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                      {fee.paymentMode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
