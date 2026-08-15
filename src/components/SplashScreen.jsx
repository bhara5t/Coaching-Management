import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.2s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    // Complete splash screen after 1.5s
    const endTimer = setTimeout(() => {
      onFinish();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#090d16',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(16, 185, 129, 0.1) 45%, rgba(9, 13, 22, 0) 70%)',
          filter: 'blur(30px)',
          animation: 'pulse 2s infinite ease-in-out',
          pointerEvents: 'none'
        }}
      />

      {/* Center Logo with Scale & Glow Animation */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'splashScaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        <div
          style={{
            width: '92px',
            height: '92px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2))',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 12px 40px rgba(37, 99, 235, 0.35), 0 0 30px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            padding: '4px'
          }}
        >
          <img
            src="/logo.png"
            alt="Coaching Management Logo"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              objectFit: 'cover'
            }}
          />
        </div>

        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginBottom: '0.35rem',
            textAlign: 'center',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Coaching Management
        </h1>

        <p
          style={{
            fontSize: '0.825rem',
            color: '#94a3b8',
            fontWeight: 500,
            letterSpacing: '0.02em',
            marginBottom: '2rem',
            textAlign: 'center'
          }}
        >
          Offline-First Education Suite
        </p>

        {/* Shimmering Progress Bar */}
        <div
          style={{
            width: '140px',
            height: '4px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #2563eb, #38bdf8, #34d399)',
              borderRadius: '9999px',
              animation: 'splashProgress 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashScaleIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes splashProgress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
