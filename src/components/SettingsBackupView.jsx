import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Building,
  Save,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Info,
  Smartphone,
  HardDrive
} from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getDB, importDBFromJSON, resetDB } from '../storage/db';

export default function SettingsBackupView({ db, onUpdateDB }) {
  const [profile, setProfile] = useState({ ...db.instituteProfile });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateDB({ ...db, instituteProfile: profile });
    showToast('Settings Saved! ✅', 'Institute details & receipt headers updated');
  };

  const handleNativeExportBackup = async () => {
    const data = getDB();
    const jsonStr = JSON.stringify(data, null, 2);
    const fileName = `CoachingManagement_Backup_${new Date().toISOString().split('T')[0]}.json`;

    try {
      // 1. Write file to device
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: jsonStr,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true
      });

      // 2. Open Android Share/Save sheet
      await Share.share({
        title: 'Coaching Management Backup',
        text: `Complete data backup: ${fileName}`,
        url: savedFile.uri,
        dialogTitle: 'Save Backup File (.JSON)'
      });

      showToast('Backup Exported! 📂', `Saved to Documents & Shared`);
    } catch (err) {
      console.log('Native file export fallback:', err);
      // Web fallback
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Backup Downloaded! 📂', fileName);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content && typeof content === 'string') {
        const success = importDBFromJSON(content);
        if (success) {
          showToast('Database Restored! ✅', 'Reloading app data...');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset database to clean initial sample data? All local changes will be replaced.')) {
      const initial = resetDB();
      onUpdateDB(initial);
      setProfile(initial.instituteProfile);
      showToast('Database Reset! 🔄', 'Sample data loaded');
    }
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 'calc(16px + env(safe-area-inset-top))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            padding: '0.85rem 1.35rem',
            borderRadius: '9999px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'fadeIn 0.25s ease',
            minWidth: '280px',
            maxWidth: '90vw',
            boxSizing: 'border-box'
          }}
        >
          <CheckCircle2 size={22} color="#ffffff" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.86rem', fontWeight: 700, minWidth: 0 }}>
            <div>{toastMessage.title}</div>
            {toastMessage.desc && (
              <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 500, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {toastMessage.desc}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Institute Profile Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Building size={18} color="var(--primary)" />
            Coaching Profile & Receipt Header
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Coaching / Academy Name *</label>
            <input
              type="text"
              required
              className="input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. Apex Coaching Institute"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tagline / Motto</label>
            <input
              type="text"
              className="input"
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              placeholder="e.g. Excellence in Education"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Phone / WhatsApp</label>
            <input
              type="text"
              className="input"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Currency Symbol</label>
            <input
              type="text"
              className="input"
              value={profile.currency}
              onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              placeholder="₹ or $"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Receipt Number Prefix</label>
            <input
              type="text"
              className="input"
              value={profile.receiptPrefix || 'REC-2026-'}
              onChange={(e) => setProfile({ ...profile, receiptPrefix: e.target.value })}
              placeholder="e.g. REC-2026-"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Institute Address (Printed on ID cards & Receipts)</label>
            <input
              type="text"
              className="input"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="e.g. 104, Education Hub, MG Road, New Delhi"
            />
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', height: '42px', fontWeight: 700 }}
            >
              <Save size={16} /> Save Coaching Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Offline Backup & Data Ownership */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <ShieldCheck size={18} color="#34d399" />
            Data Ownership & Offline Backup
          </h3>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          <strong>Coaching Management</strong> is 100% private and offline-first. All your students, batch registers, attendance logs, and fee receipts are stored securely on this device without external tracking.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={handleNativeExportBackup}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: '42px', fontWeight: 700 }}
          >
            <Download size={16} /> Export Full JSON Backup
          </button>

          <label
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', height: '42px', cursor: 'pointer', fontWeight: 700 }}
          >
            <Upload size={16} /> Restore Database from Backup File
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* App Information & Diagnostics */}
      <div className="card" style={{ background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <Smartphone size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            App Information
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div>App Version: <strong style={{ color: 'var(--text-primary)' }}>v2.4.0 (Native Android)</strong></div>
          <div>Storage Engine: <strong style={{ color: 'var(--text-primary)' }}>Encrypted LocalStore</strong></div>
          <div>Total Students: <strong style={{ color: 'var(--text-primary)' }}>{db.students.length}</strong></div>
          <div>Total Batches: <strong style={{ color: 'var(--text-primary)' }}>{db.batches.length}</strong></div>
        </div>
      </div>

    </div>
  );
}
