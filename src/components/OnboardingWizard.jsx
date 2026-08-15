import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Users,
  Layers,
  ArrowRight,
  Phone,
  MapPin,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingWizard({ db, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const [instituteData, setInstituteData] = useState({
    name: db.instituteProfile?.name === 'Coaching Management' ? '' : (db.instituteProfile?.name || ''),
    tagline: db.instituteProfile?.tagline || 'Excellence in Education',
    phone: db.instituteProfile?.phone || '',
    address: db.instituteProfile?.address || '',
    currency: db.instituteProfile?.currency || '₹',
    receiptPrefix: db.instituteProfile?.receiptPrefix || 'REC-2026-',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep === 1 && !instituteData.name.trim()) {
      alert('Please enter your Coaching / Academy name to continue.');
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishSetup = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    const updatedInstitute = {
      ...db.instituteProfile,
      name: instituteData.name.trim() || 'My Coaching Institute',
      tagline: instituteData.tagline.trim(),
      phone: instituteData.phone.trim(),
      address: instituteData.address.trim(),
      currency: instituteData.currency.trim() || '₹',
      receiptPrefix: instituteData.receiptPrefix.trim() || 'REC-2026-',
    };

    onComplete({
      ...db,
      isSetupCompleted: true,
      instituteProfile: updatedInstitute,
      batches: db.batches || [],
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100%',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      background: 'var(--bg-canvas, #090d16)',
      color: 'var(--text-primary, #f8fafc)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 'calc(1.5rem + env(safe-area-inset-top)) 1.25rem calc(1.5rem + env(safe-area-inset-bottom)) 1.25rem',
      maxWidth: '480px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      
      {/* Top Header & Progress Stepper */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1.5px solid rgba(59, 130, 246, 0.4)'
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Coaching Management
            </span>
          </div>

          <button
            onClick={finishSetup}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Skip Setup
          </button>
        </div>

        {/* Stepper Dots */}
        <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.5rem' }}>
          {[0, 1, 2, 3].map(step => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '9999px',
                background: step === currentStep
                  ? 'var(--primary, #2563eb)'
                  : step < currentStep
                  ? 'rgba(37, 99, 235, 0.5)'
                  : 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Slide Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* STEP 0: WELCOME & HIGHLIGHTS */}
        {currentStep === 0 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              width: '96px',
              height: '96px',
              margin: '0 auto 1.25rem auto',
              borderRadius: '24px',
              background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0.05) 70%)',
              border: '1.5px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 35px rgba(37, 99, 235, 0.25)'
            }}>
              <img
                src="/logo.png"
                alt="App Logo"
                style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }}
              />
            </div>

            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem', color: '#ffffff' }}>
              Welcome to Coaching Management
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              The offline-first operating system for tuition centers, coaching institutes, and independent tutors.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left' }}>
              <div style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(37,99,235,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>100% Offline & Private</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Your data stays secure on your device.</div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>Digital Receipts & WhatsApp Alerts</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>1-tap fee collection and parent messaging.</div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>Fast Attendance & Excel Reports</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>1-tap marking and monthly export register.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: INSTITUTE PROFILE */}
        {currentStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary, #3b82f6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 1 of 3
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                Coaching Profile Setup
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.15rem' }}>
                These details will be printed on student ID cards and digital receipts.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Coaching / Academy Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Apex Coaching Center"
                  className="input"
                  value={instituteData.name}
                  onChange={(e) => setInstituteData({ ...instituteData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline / Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Excellence in Education"
                  className="input"
                  value={instituteData.tagline}
                  onChange={(e) => setInstituteData({ ...instituteData, tagline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Contact / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  className="input"
                  value={instituteData.phone}
                  onChange={(e) => setInstituteData({ ...instituteData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institute Address</label>
                <input
                  type="text"
                  placeholder="e.g. 104, Education Hub, New Delhi"
                  className="input"
                  value={instituteData.address}
                  onChange={(e) => setInstituteData({ ...instituteData, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREFERENCES & CURRENCY */}
        {currentStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary, #3b82f6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Step 2 of 3
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                Currency & Billing Format
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.15rem' }}>
                Customize your fee currency and official receipt numbers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Select Currency</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { symbol: '₹', label: 'INR (₹)' },
                    { symbol: '$', label: 'USD ($)' },
                    { symbol: '€', label: 'EUR (€)' },
                    { symbol: '£', label: 'GBP (£)' },
                    { symbol: 'AED', label: 'AED' },
                    { symbol: 'Rs', label: 'PKR / NPR' }
                  ].map(curr => (
                    <button
                      type="button"
                      key={curr.symbol}
                      onClick={() => setInstituteData({ ...instituteData, currency: curr.symbol })}
                      className={`btn btn-sm ${instituteData.currency === curr.symbol ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ justifyContent: 'center', height: '38px', fontWeight: 700 }}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Receipt Number Prefix</label>
                <input
                  type="text"
                  placeholder="e.g. REC-2026-"
                  className="input"
                  value={instituteData.receiptPrefix}
                  onChange={(e) => setInstituteData({ ...instituteData, receiptPrefix: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Sample receipt number: <strong style={{ color: 'var(--primary)' }}>{instituteData.receiptPrefix || 'REC-2026-'}001</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: READY TO LAUNCH */}
        {currentStep === 3 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))',
              border: '2px solid rgba(16, 185, 129, 0.5)',
              color: '#34d399',
              margin: '0 auto 1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
              You're All Set!
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '1.25rem' }}>
              Your coaching workspace is configured and ready.
            </p>

            {/* Preview Summary Card */}
            <div style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: 'var(--radius-lg, 16px)',
              padding: '1rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="student-avatar-circle" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                  {instituteData.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff' }}>
                    {instituteData.name || 'My Coaching Institute'}
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {instituteData.tagline || 'Excellence in Education'}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle, #090d16)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.78rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.45rem',
                border: '1px solid var(--border-color, #1e293b)'
              }}>
                <div>Currency: <strong style={{ color: '#34d399' }}>{instituteData.currency}</strong></div>
                <div>Receipts: <strong style={{ color: '#60a5fa' }}>{instituteData.receiptPrefix || 'REC-'}001</strong></div>
                <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                  {instituteData.phone ? `Phone: ${instituteData.phone}` : 'No phone recorded'}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation Buttons */}
      <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.5rem' }}>
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="btn btn-secondary"
            style={{ minWidth: '90px', justifyContent: 'center', height: '46px', fontWeight: 700 }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        <button
          onClick={handleNext}
          className="btn btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            height: '46px',
            fontWeight: 800,
            fontSize: '0.92rem',
            background: currentStep === 3 ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
            borderColor: currentStep === 3 ? '#059669' : undefined
          }}
        >
          {currentStep === 0 ? (
            <>Get Started <ArrowRight size={16} /></>
          ) : currentStep === totalSteps - 1 ? (
            <>Launch Dashboard <Sparkles size={16} /></>
          ) : (
            <>Continue <ChevronRight size={16} /></>
          )}
        </button>
      </div>

    </div>
  );
}
