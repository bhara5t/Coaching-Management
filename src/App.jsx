import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsView from './components/StudentsView';
import AttendanceView from './components/AttendanceView';
import FeesView from './components/FeesView';
import BatchesView from './components/BatchesView';
import StaffView from './components/StaffView';
import EnquiriesView from './components/EnquiriesView';
import SettingsBackupView from './components/SettingsBackupView';
import ReceiptModal from './components/ReceiptModal';
import IdCardModal from './components/IdCardModal';
import OnboardingWizard from './components/OnboardingWizard';
import SplashScreen from './components/SplashScreen';
import { getDB, saveDB } from './storage/db';
import { App as CapacitorApp } from '@capacitor/app';
import {
  Menu,
  X,
  PlusCircle,
  UserPlus,
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [db, setDb] = useState(() => getDB());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState(['dashboard']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [selectedReceiptFee, setSelectedReceiptFee] = useState(null);
  const [selectedIdCardStudent, setSelectedIdCardStudent] = useState(null);
  const [preselectedStudentForFee, setPreselectedStudentForFee] = useState(null);

  // Keep refs for asynchronous back button event handler
  const stateRef = useRef({
    selectedReceiptFee,
    selectedIdCardStudent,
    isSidebarOpen,
    activeTab,
    tabHistory
  });

  useEffect(() => {
    stateRef.current = {
      selectedReceiptFee,
      selectedIdCardStudent,
      isSidebarOpen,
      activeTab,
      tabHistory
    };
  }, [selectedReceiptFee, selectedIdCardStudent, isSidebarOpen, activeTab, tabHistory]);

  // Navigate tab with history tracking
  const navigateTo = (tab) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, tab]);
      setActiveTab(tab);
    }
    setIsSidebarOpen(false);
  };

  // Android Native Hardware Back Button & Gesture Handler
  useEffect(() => {
    let backListener = null;

    const setupBackHandler = async () => {
      try {
        backListener = await CapacitorApp.addListener('backButton', () => {
          const {
            selectedReceiptFee: receipt,
            selectedIdCardStudent: idCard,
            isSidebarOpen: drawerOpen,
            activeTab: currentTab,
            tabHistory: history
          } = stateRef.current;

          // 1. Close active modals if open
          if (receipt) {
            setSelectedReceiptFee(null);
            return;
          }
          if (idCard) {
            setSelectedIdCardStudent(null);
            return;
          }

          // 2. Close side drawer if open
          if (drawerOpen) {
            setIsSidebarOpen(false);
            return;
          }

          // 3. Go back in tab history
          if (history.length > 1) {
            const updatedHistory = [...history];
            updatedHistory.pop();
            const previousTab = updatedHistory[updatedHistory.length - 1];
            setTabHistory(updatedHistory);
            setActiveTab(previousTab);
            return;
          }

          // 4. Fallback to dashboard if not on dashboard
          if (currentTab !== 'dashboard') {
            setActiveTab('dashboard');
            setTabHistory(['dashboard']);
            return;
          }

          // 5. If already on dashboard with no open modals, exit app
          CapacitorApp.exitApp();
        });
      } catch (err) {
        console.log('Running in browser or non-native shell');
      }
    };

    setupBackHandler();

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, []);

  // Update DB & sync to local storage
  const handleUpdateDB = (newDB) => {
    setDb(newDB);
    saveDB(newDB);
  };

  // Compute counts for sidebar badges
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const pendingCount = db.students.filter(s => {
    if (s.status !== 'ACTIVE') return false;
    return !db.fees.some(f => f.studentId === s.id && f.monthFor === currentMonthName);
  }).length;

  const counts = {
    students: db.students.filter(s => s.status === 'ACTIVE').length,
    batches: db.batches.length,
    staff: db.staff.filter(s => s.status === 'ACTIVE').length,
    enquiries: db.enquiries.filter(e => e.status !== 'ENROLLED' && e.status !== 'DROPPED').length,
    pendingFees: pendingCount,
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'students': return 'Students';
      case 'attendance': return 'Attendance';
      case 'fees': return 'Fees & Receipts';
      case 'batches': return 'Class Batches';
      case 'staff': return 'Staff & Faculty';
      case 'enquiries': return 'Admissions CRM';
      case 'settings': return 'Settings & Backup';
      default: return 'Coaching Management';
    }
  };

  const instituteInitial = db.instituteProfile?.name?.charAt(0) || 'C';
  const instituteName = db.instituteProfile?.name || 'Coaching Management';

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      {!db.isSetupCompleted ? (
        <OnboardingWizard db={db} onComplete={handleUpdateDB} />
      ) : (
        <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        counts={counts}
        institute={db.instituteProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-bar">
          <div className="top-bar-branding">
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                border: '1.5px solid rgba(59, 130, 246, 0.4)',
                flexShrink: 0
              }}
            />
            <div className="header-text-group">
              <span className="header-caption">{instituteName}</span>
              <h1 className="top-bar-title">{getPageTitle()}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="top-actions hide-on-mobile">
              {activeTab !== 'fees' && (
                <button
                  onClick={() => {
                    setPreselectedStudentForFee(db.students[0]);
                    navigateTo('fees');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <PlusCircle size={14} /> Collect Fee
                </button>
              )}
              {activeTab !== 'students' && (
                <button
                  onClick={() => navigateTo('students')}
                  className="btn btn-primary btn-sm"
                >
                  <UserPlus size={14} /> Add Student
                </button>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="header-menu-btn"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="header-status-indicator" title="Local DB Active" />
            </button>
          </div>
        </header>

        {/* View Switcher */}
        <main className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard
              db={db}
              setActiveTab={navigateTo}
              onOpenCollectFee={() => {
                setPreselectedStudentForFee(db.students[0]);
                navigateTo('fees');
              }}
              onOpenAddStudent={() => navigateTo('students')}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              db={db}
              onUpdateDB={handleUpdateDB}
              onSelectStudentForIdCard={(student) => setSelectedIdCardStudent(student)}
              onSelectStudentForFee={(student) => {
                setPreselectedStudentForFee(student);
                navigateTo('fees');
              }}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              db={db}
              onUpdateDB={handleUpdateDB}
            />
          )}

          {activeTab === 'fees' && (
            <FeesView
              db={db}
              onUpdateDB={handleUpdateDB}
              onOpenReceipt={(fee) => setSelectedReceiptFee(fee)}
              preselectedStudent={preselectedStudentForFee}
            />
          )}

          {activeTab === 'batches' && (
            <BatchesView
              db={db}
              onUpdateDB={handleUpdateDB}
              onSelectBatch={() => navigateTo('students')}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView
              db={db}
              onUpdateDB={handleUpdateDB}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesView
              db={db}
              onUpdateDB={handleUpdateDB}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsBackupView
              db={db}
              onUpdateDB={handleUpdateDB}
            />
          )}
        </main>

        {/* Telegram-style Floating Mobile Navigation */}
        <nav className={`bottom-nav floating-dock ${isSidebarOpen ? 'drawer-open' : ''}`}>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            aria-label="Dashboard"
          >
            <LayoutDashboard size={20} />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigateTo('students')}
            className={`bottom-nav-item ${activeTab === 'students' ? 'active' : ''}`}
            aria-label="Students"
          >
            <Users size={20} />
            <span>Students</span>
          </button>
          <button
            onClick={() => navigateTo('attendance')}
            className={`bottom-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            aria-label="Attendance"
          >
            <CalendarCheck size={20} />
            <span>Attendance</span>
          </button>
          <button
            onClick={() => navigateTo('fees')}
            className={`bottom-nav-item ${activeTab === 'fees' ? 'active' : ''}`}
            aria-label="Fees"
          >
            <CreditCard size={20} />
            <span>Fees</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      {selectedReceiptFee && (
        <ReceiptModal
          fee={selectedReceiptFee}
          db={db}
          onClose={() => setSelectedReceiptFee(null)}
        />
      )}

      {selectedIdCardStudent && (
        <IdCardModal
          student={selectedIdCardStudent}
          db={db}
          onClose={() => setSelectedIdCardStudent(null)}
        />
      )}
        </div>
      )}
    </>
  );
}
