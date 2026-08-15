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
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingWizard({ db, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const [instituteData, setInstituteData] = useState({
    name: db.instituteProfile?.name === 'Coaching Management' ? '' : (db.instituteProfile?.name || ''),
    tagline: db.instituteProfile?.tagline === 'Excellence in Education' ? '' : (db.instituteProfile?.tagline || ''),
    phone: db.instituteProfile?.phone || '',
    address: db.instituteProfile?.address || '',
    currency: db.instituteProfile?.currency || '₹',
    receiptPrefix: db.instituteProfile?.receiptPrefix || 'REC-2026-',
  });

  const totalSteps = 4;

  // Step 1: All 4 fields must be filled to enable Continue
  const isStep1Complete = Boolean(
    instituteData.name.trim() &&
    instituteData.tagline.trim() &&
    instituteData.phone.trim() &&
    instituteData.address.trim()
  );

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Complete) {
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
        particleCount: 75,
        spread: 65,
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
    <div
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        width: '100%',
        background: 'var(--bg-canvas, #090d16)',
        color: 'var(--text-primary, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'max(1.25rem, calc(0.75rem + env(safe-area-inset-top))) 1.25rem max(1.25rem, calc(0.75rem + env(safe-area-inset-bottom))) 1.25rem',
        maxWidth: '460px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      
      {/* Top Stepper Track */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.45rem' }}>
          {[0, 1, 2, 3].map(step => (
            <div
              key={step}
              onClick={() => {
                if (step < currentStep || (step === 1 && instituteData.name.trim())) {
                  setCurrentStep(step);
                }
              }}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '9999px',
                cursor: 'pointer',
                background: step === currentStep
                  ? 'var(--primary, #3b82f6)'
                  : step < currentStep
                  ? 'rgba(59, 130, 246, 0.6)'
                  : 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div style={{
        flex: 1,
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        
        {/* Slidable Track */}
        <div style={{
          display: 'flex',
          width: '100%',
          transform: `translateX(-${currentStep * 100}%)`,
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform'
        }}>

          {/* SLIDE 0: MINIMALIST WELCOME */}
          <div style={{ minWidth: '100%', width: '100%', boxSizing: 'border-box', padding: '0.25rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '76px',
                height: '76px',
                margin: '0 auto 1rem auto',
                borderRadius: '20px',
                background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0.05) 70%)',
                border: '1.5px solid rgba(59, 130, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.2)'
              }}>
                <img
                  src="/logo.png"
                  alt="App Logo"
                  style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem', color: '#ffffff' }}>
                Welcome to Coaching Management
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                Fast, offline operating system for tuition centers, coaching academies & tutors.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', textAlign: 'left' }}>
                <div style={{
                  background: 'var(--bg-surface, #111827)',
                  border: '1px solid var(--border-color, #1e293b)',
                  borderRadius: 'var(--radius-md, 12px)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37,99,235,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>100% Offline & Private</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>Your data stays secure on your device.</div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-surface, #111827)',
                  border: '1px solid var(--border-color, #1e293b)',
                  borderRadius: 'var(--radius-md, 12px)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Digital Receipts & Fee Tracking</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>1-tap fee collection and instant digital slips.</div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-surface, #111827)',
                  border: '1px solid var(--border-color, #1e293b)',
                  borderRadius: 'var(--radius-md, 12px)',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CalendarCheck size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Fast Attendance & Excel Reports</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>1-tap marking and monthly export register.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 1: INSTITUTE PROFILE */}
          <div style={{ minWidth: '100%', width: '100%', boxSizing: 'border-box', padding: '0.25rem 0' }}>
            <div>
              <div style={{ marginBottom: '1.15rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary, #3b82f6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 1 of 3
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
                  Coaching Profile
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.1rem' }}>
                  These details will appear on student ID cards and receipts.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Coaching / Academy Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Coaching Center"
                    className="input"
                    value={instituteData.name}
                    onChange={(e) => setInstituteData({ ...instituteData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Tagline / Motto
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Excellence in Education"
                    className="input"
                    value={instituteData.tagline}
                    onChange={(e) => setInstituteData({ ...instituteData, tagline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Contact / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="input"
                    value={instituteData.phone}
                    onChange={(e) => setInstituteData({ ...instituteData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Institute Address
                  </label>
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
          </div>

          {/* SLIDE 2: PREFERENCES & CURRENCY */}
          <div style={{ minWidth: '100%', width: '100%', boxSizing: 'border-box', padding: '0.25rem 0' }}>
            <div>
              <div style={{ marginBottom: '1.15rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary, #3b82f6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step 2 of 3
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.15rem' }}>
                  Currency & Format
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.1rem' }}>
                  Select your fee currency and receipt number format.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Select Currency
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
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
                        style={{ justifyContent: 'center', height: '38px', fontWeight: 700, fontSize: '0.82rem' }}
                      >
                        {curr.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Receipt Number Prefix
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-2026-"
                    className="input"
                    value={instituteData.receiptPrefix}
                    onChange={(e) => setInstituteData({ ...instituteData, receiptPrefix: e.target.value })}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    Preview: <strong style={{ color: 'var(--primary)' }}>{instituteData.receiptPrefix || 'REC-2026-'}001</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3: READY TO LAUNCH */}
          <div style={{ minWidth: '100%', width: '100%', boxSizing: 'border-box', padding: '0.25rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                color: '#34d399',
                margin: '0 auto 0.75rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)'
              }}>
                <CheckCircle2 size={30} />
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                You're All Set!
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.85rem' }}>
                Your coaching workspace is configured and ready.
              </p>

              {/* Minimal Summary Card */}
              <div style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '0.85rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="student-avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.88rem' }}>
                    {instituteData.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                      {instituteData.name || 'My Coaching Institute'}
                    </h4>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {instituteData.tagline || 'Excellence in Education'}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-subtle, #090d16)',
                  borderRadius: 'var(--radius-md, 10px)',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.74rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.35rem',
                  border: '1px solid var(--border-color, #1e293b)'
                }}>
                  <div>Currency: <strong style={{ color: '#34d399' }}>{instituteData.currency}</strong></div>
                  <div>Receipts: <strong style={{ color: '#60a5fa' }}>{instituteData.receiptPrefix || 'REC-'}001</strong></div>
                  <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                    {instituteData.phone ? `Phone: ${instituteData.phone}` : 'No contact saved'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="btn btn-secondary"
            style={{ minWidth: '85px', justifyContent: 'center', height: '44px', fontWeight: 700 }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={currentStep === 1 && !isStep1Complete}
          className="btn btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            height: '44px',
            fontWeight: 800,
            fontSize: '0.9rem',
            opacity: (currentStep === 1 && !isStep1Complete) ? 0.45 : 1,
            cursor: (currentStep === 1 && !isStep1Complete) ? 'not-allowed' : 'pointer',
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
