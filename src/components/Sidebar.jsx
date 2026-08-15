import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Layers,
  UserCheck,
  HelpCircle,
  Settings,
  Sparkles,
  X,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts, institute, isOpen, onClose }) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users, badge: counts.students },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Fees & Receipts', icon: CreditCard, badge: counts.pendingFees > 0 ? `${counts.pendingFees} Due` : null, badgeType: 'warning' },
  ];

  const adminNav = [
    { id: 'batches', label: 'Class Batches', icon: Layers, badge: counts.batches },
    { id: 'staff', label: 'Staff & Faculty', icon: UserCheck, badge: counts.staff },
    { id: 'enquiries', label: 'Admissions CRM', icon: HelpCircle, badge: counts.enquiries },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
  ];

  const renderNavGroup = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id);
            if (onClose) onClose();
          }}
          className={`nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={18} className="nav-item-icon" />
          <span>{item.label}</span>
          {item.badge !== undefined && item.badge !== null && (
            <span className={`nav-badge ${item.badgeType === 'warning' ? 'badge-warning' : ''}`}>
              {item.badge}
            </span>
          )}
        </button>
      );
    });
  };

  const instituteName = institute?.name || 'Coaching Management';
  const instituteInitial = instituteName.charAt(0) || 'C';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close Sidebar Overlay"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                border: '1.5px solid rgba(59, 130, 246, 0.4)',
                flexShrink: 0
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="app-title" style={{ fontSize: '0.98rem', fontWeight: 800 }}>
                  {instituteName}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                <span className="status-dot" style={{ width: '6px', height: '6px' }} />
                Offline Database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="drawer-close-btn"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Core Operations</div>
          {renderNavGroup(mainNav)}

          <div className="nav-section-divider" />

          <div className="nav-section-title">Management</div>
          {renderNavGroup(adminNav)}
        </nav>

        {/* Drawer Footer */}
        <div className="sidebar-footer">
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <div><strong>100% Private & Offline</strong></div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.05rem' }}>Data saved on your phone</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
