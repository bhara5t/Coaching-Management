import React, { useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Users,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export default function AttendanceView({ db, onUpdateDB }) {
  const [selectedBatchId, setSelectedBatchId] = useState(db.batches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const selectedBatch = db.batches.find(b => b.id === selectedBatchId);
  const activeStudents = db.students.filter(s => s.batchId === selectedBatchId && s.status === 'ACTIVE');

  const getAttendanceStatus = (studentId, date = selectedDate) => {
    const record = db.attendance.find(a => a.studentId === studentId && a.date === date && a.batchId === selectedBatchId);
    return record?.status || 'UNMARKED';
  };

  const setStatus = (studentId, status) => {
    const existingIndex = db.attendance.findIndex(
      a => a.studentId === studentId && a.date === selectedDate && a.batchId === selectedBatchId
    );

    let updatedAttendance = [...db.attendance];
    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], status };
    } else {
      updatedAttendance.push({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        studentId,
        batchId: selectedBatchId,
        date: selectedDate,
        status
      });
    }
    onUpdateDB({ ...db, attendance: updatedAttendance });
  };

  const markAll = (status) => {
    let updatedAttendance = [...db.attendance];
    activeStudents.forEach(student => {
      const existingIndex = updatedAttendance.findIndex(
        a => a.studentId === student.id && a.date === selectedDate && a.batchId === selectedBatchId
      );
      if (existingIndex >= 0) {
        updatedAttendance[existingIndex] = { ...updatedAttendance[existingIndex], status };
      } else {
        updatedAttendance.push({
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          studentId: student.id,
          batchId: selectedBatchId,
          date: selectedDate,
          status
        });
      }
    });
    onUpdateDB({ ...db, attendance: updatedAttendance });
  };

  const presentStudents = activeStudents.filter(s => getAttendanceStatus(s.id) === 'PRESENT');
  const absentStudents = activeStudents.filter(s => getAttendanceStatus(s.id) === 'ABSENT');
  const leaveStudents = activeStudents.filter(s => getAttendanceStatus(s.id) === 'LEAVE');
  const markedCount = presentStudents.length + absentStudents.length + leaveStudents.length;
  const attendanceRate = markedCount > 0 ? Math.round((presentStudents.length / markedCount) * 100) : 0;

  const sendWhatsAppAbsentAlert = (student) => {
    if (!student.parentPhone) return;
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Dear Parent, this is to inform you that your ward *${student.name}* was marked *ABSENT* from *${selectedBatch?.name}* class today (${selectedDate}).\n\nRegards,\n*${db.instituteProfile?.name}*`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'ST';
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

  // Generate 7 days around the current selected date
  const generateDateStrip = () => {
    const dates = [];
    const base = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      dates.push({ iso, dayName, dayNum });
    }
    return dates;
  };

  const dateStrip = generateDateStrip();

  const changeDay = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Helper to trigger native device file save & open in Excel/Sheets
  const triggerDownload = async (csvContent, fileName) => {
    try {
      // 1. Write directly to native Android device documents/storage
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: '\uFEFF' + csvContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true
      });

      // 2. Open Android system Share/Open sheet (lets user open in Excel, Sheets, WhatsApp, or Save to Files)
      await Share.share({
        title: 'Attendance Report (Excel)',
        text: `Attendance Report: ${fileName}`,
        url: savedFile.uri,
        dialogTitle: 'Save or Open Attendance Report in Excel'
      });

      setToastMessage({
        title: 'Saved to Documents folder! 📂',
        desc: `File: ${fileName}`
      });
    } catch (err) {
      console.log('Native file save error, using web fallback:', err);
      // Fallback to browser blob download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToastMessage({
        title: 'Saved to Downloads folder! 📂',
        desc: fileName
      });
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Export Daily Attendance Sheet for Excel
  const exportDailyExcel = () => {
    const instituteName = db.instituteProfile?.name || 'Coaching Management';
    const batchName = selectedBatch?.name || 'All Batches';
    const formattedDate = formatDisplayDate(selectedDate);

    let csv = `sep=,\n`;
    csv += `"${instituteName} - Daily Attendance Report"\n`;
    csv += `"Batch:","${batchName}"\n`;
    csv += `"Date:","${formattedDate}"\n`;
    csv += `"Summary:","Total: ${activeStudents.length} | Present: ${presentStudents.length} | Absent: ${absentStudents.length} | Leave: ${leaveStudents.length} | Rate: ${attendanceRate}%"\n`;
    csv += `"Exported On:","${new Date().toLocaleString()}"\n\n`;

    // Table Header
    csv += `"Roll No","Student Name","Class / Standard","Parent WhatsApp","Attendance Status","Date"\n`;

    // Rows
    activeStudents.forEach(s => {
      const status = getAttendanceStatus(s.id);
      csv += `"${s.rollNo || ''}","${s.name}","${s.standard || ''}","${s.parentPhone || ''}","${status}","${selectedDate}"\n`;
    });

    const safeBatch = (selectedBatch?.name || 'Batch').replace(/[^a-zA-Z0-9]/g, '_');
    triggerDownload(csv, `Attendance_Daily_${safeBatch}_${selectedDate}.csv`);
    setShowExportModal(false);
  };

  // 2. Export Monthly Full Register for Excel
  const exportMonthlyExcel = () => {
    const instituteName = db.instituteProfile?.name || 'Coaching Management';
    const batchName = selectedBatch?.name || 'All Batches';
    
    // Extract year & month from selectedDate
    const [yearStr, monthStr] = selectedDate.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthTitle = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    let csv = `sep=,\n`;
    csv += `"${instituteName} - Monthly Attendance Register"\n`;
    csv += `"Batch:","${batchName}"\n`;
    csv += `"Month:","${monthTitle}"\n`;
    csv += `"Total Enrolled Students:","${activeStudents.length}"\n`;
    csv += `"Exported On:","${new Date().toLocaleString()}"\n\n`;

    // Build Table Header: Roll No, Name, Class, Day 1...Day N, Total P, Total A, Total L, %
    csv += `"Roll No","Student Name","Class",`;
    for (let day = 1; day <= daysInMonth; day++) {
      csv += `"${String(day).padStart(2, '0')}",`;
    }
    csv += `"Total Present","Total Absent","Total Leave","Attendance %"\n`;

    // Rows
    activeStudents.forEach(s => {
      let pCount = 0;
      let aCount = 0;
      let lCount = 0;

      csv += `"${s.rollNo || ''}","${s.name}","${s.standard || ''}",`;

      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`;
        const status = getAttendanceStatus(s.id, dayDate);
        
        let code = '-';
        if (status === 'PRESENT') {
          code = 'P';
          pCount++;
        } else if (status === 'ABSENT') {
          code = 'A';
          aCount++;
        } else if (status === 'LEAVE') {
          code = 'L';
          lCount++;
        }
        csv += `"${code}",`;
      }

      const totalMarked = pCount + aCount + lCount;
      const rate = totalMarked > 0 ? Math.round((pCount / totalMarked) * 100) : 0;

      csv += `"${pCount}","${aCount}","${lCount}","${rate}%"\n`;
    });

    const safeBatch = (selectedBatch?.name || 'Batch').replace(/[^a-zA-Z0-9]/g, '_');
    triggerDownload(csv, `Attendance_Monthly_${safeBatch}_${yearStr}_${monthStr}.csv`);
    setShowExportModal(false);
  };

  return (
    <div>
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

      {/* Horizontal Batch Chips Bar */}
      <div className="chips-bar">
        {db.batches.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBatchId(b.id)}
            className={`chip-btn ${selectedBatchId === b.id ? 'active' : ''}`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Modern Date Bubble Selector & Action Card */}
      <div className="card" style={{ padding: '0.95rem 1rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <button onClick={() => changeDay(-1)} className="btn btn-secondary btn-icon btn-sm" aria-label="Previous day">
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
              {formatDisplayDate(selectedDate)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.05rem' }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>
          <button onClick={() => changeDay(1)} className="btn btn-secondary btn-icon btn-sm" aria-label="Next day">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Date Strip */}
        <div className="calendar-strip">
          {dateStrip.map(item => {
            const isSelected = item.iso === selectedDate;
            const isToday = item.iso === new Date().toISOString().split('T')[0];
            return (
              <div
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`date-bubble ${isSelected ? 'active' : ''}`}
                style={isToday && !isSelected ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
              >
                <span className="date-bubble-day">{item.dayName}</span>
                <span className="date-bubble-num">{item.dayNum}</span>
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={() => markAll('PRESENT')} className="btn btn-success" style={{ fontWeight: 700 }}>
            <Check size={15} /> All Present
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-primary"
            style={{ fontWeight: 700 }}
          >
            <Download size={15} /> Export Excel
          </button>
        </div>

        {absentStudents.length > 0 && (
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '0.5rem', color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)', justifyContent: 'center' }}
          >
            <MessageSquare size={15} /> Send WhatsApp to {absentStudents.length} Absent Students
          </button>
        )}

        {/* Live Attendance Counter */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.4rem',
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          textAlign: 'center'
        }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}>
            Total: <strong>{activeStudents.length}</strong>
          </div>
          <div style={{ background: 'var(--success-light)', color: '#34d399', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}>
            P: <strong>{presentStudents.length}</strong>
          </div>
          <div style={{ background: 'var(--danger-light)', color: '#f87171', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}>
            A: <strong>{absentStudents.length}</strong>
          </div>
          <div style={{ background: 'var(--warning-light)', color: '#fbbf24', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}>
            L: <strong>{leaveStudents.length}</strong>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {activeStudents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            No active students enrolled in this batch.
          </div>
        ) : (
          activeStudents.map(student => {
            const status = getAttendanceStatus(student.id);
            return (
              <div
                key={student.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                  <div className="student-avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                    {getInitials(student.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        #{student.rollNo}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {student.parentPhone || 'No phone'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setStatus(student.id, 'PRESENT')}
                    className={`btn btn-sm ${status === 'PRESENT' ? 'btn-success' : 'btn-secondary'}`}
                    style={{
                      minWidth: '38px',
                      padding: '0.35rem 0.6rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    P
                  </button>
                  <button
                    onClick={() => setStatus(student.id, 'ABSENT')}
                    className={`btn btn-sm ${status === 'ABSENT' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{
                      minWidth: '38px',
                      padding: '0.35rem 0.6rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setStatus(student.id, 'LEAVE')}
                    className={`btn btn-sm ${status === 'LEAVE' ? 'btn-secondary' : 'btn-secondary'}`}
                    style={{
                      minWidth: '38px',
                      padding: '0.35rem 0.6rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-sm)',
                      ...(status === 'LEAVE' ? { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } : {})
                    }}
                  >
                    L
                  </button>
                  {status === 'ABSENT' && student.parentPhone && (
                    <button
                      onClick={() => sendWhatsAppAbsentAlert(student)}
                      className="btn btn-sm btn-secondary btn-icon"
                      style={{ color: '#16a34a', borderColor: 'rgba(22, 163, 74, 0.3)', background: 'rgba(22, 163, 74, 0.1)' }}
                      title="Send WhatsApp alert"
                    >
                      <Send size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export Excel Options Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="card-title">
                <FileSpreadsheet size={18} color="var(--primary)" />
                Download Attendance Excel
              </h3>
              <button onClick={() => setShowExportModal(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Select the format of attendance report you want to download for <strong>{selectedBatch?.name}</strong>:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Daily Sheet Option */}
                <div
                  onClick={exportDailyExcel}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.95rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        Daily Sheet ({formatDisplayDate(selectedDate)})
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Roll #, Name, Phone, Status (P/A/L)
                      </div>
                    </div>
                  </div>
                  <Download size={18} color="var(--primary)" />
                </div>

                {/* Monthly Register Option */}
                <div
                  onClick={exportMonthlyExcel}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1.5px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.95rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        Full Month Register (Day 1 - 31)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        All 31 calendar columns, totals & % rate
                      </div>
                    </div>
                  </div>
                  <Download size={18} color="var(--success)" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowExportModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="card-title">
                <MessageSquare size={17} color="#16a34a" />
                Absent Student Alerts ({absentStudents.length})
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Tap to notify parents regarding absence for {formatDisplayDate(selectedDate)}:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {absentStudents.map(student => (
                  <div
                    key={student.id}
                    style={{
                      padding: '0.75rem 0.85rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{student.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{student.parentPhone || 'No phone'}</div>
                    </div>
                    {student.parentPhone && (
                      <button
                        onClick={() => sendWhatsAppAbsentAlert(student)}
                        className="btn btn-sm btn-success"
                      >
                        <Send size={13} /> Send Alert
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBroadcastModal(false)} className="btn btn-secondary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
