import React, { useRef, useState } from 'react';
import { colors } from '../constants/colors';
import PinKeypad from '../components/PinKeypad';
import { getSettings } from '../storage/letterStorage';

interface Props { onUnlock: () => void; }

const PIN_LEN = 4;

/* Fixed particle positions so they don't recompute on every render */
const PARTICLES = [
  { left: '12%', delay: '0s',   dur: '10s', size: '3px', opacity: 0.55 },
  { left: '27%', delay: '2.5s', dur: '13s', size: '2px', opacity: 0.40 },
  { left: '43%', delay: '1.2s', dur: '9s',  size: '4px', opacity: 0.45 },
  { left: '58%', delay: '4s',   dur: '12s', size: '2px', opacity: 0.50 },
  { left: '71%', delay: '0.7s', dur: '11s', size: '3px', opacity: 0.35 },
  { left: '84%', delay: '3.3s', dur: '8s',  size: '2px', opacity: 0.45 },
  { left: '20%', delay: '6s',   dur: '14s', size: '3px', opacity: 0.30 },
  { left: '65%', delay: '5s',   dur: '10s', size: '2px', opacity: 0.40 },
  { left: '90%', delay: '1.8s', dur: '12s', size: '3px', opacity: 0.35 },
];

export default function LockScreen({ onUnlock }: Props) {
  const [pin, setPin]         = useState('');
  const [hasError, setError]  = useState(false);
  const [errMsg, setErrMsg]   = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  const shake = () => {
    const el = dotsRef.current;
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  };

  const handleKey = (key: string) => {
    if (pin.length >= PIN_LEN) return;
    const next = pin + key;
    setPin(next);

    if (next.length === PIN_LEN) {
      const { pin: correctPin } = getSettings();
      if (next === correctPin) {
        setUnlocking(true);
        setTimeout(onUnlock, 520);
      } else {
        shake();
        setError(true);
        setErrMsg('아직 이 공간에 들어올 수 없어요.');
        setTimeout(() => { setPin(''); setError(false); setErrMsg(''); }, 1500);
      }
    }
  };

  const handleDel = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
    setErrMsg('');
  };

  return (
    <div style={s.container}>
      {/* Atmospheric light rays */}
      <div style={s.ray1} />
      <div style={s.ray2} />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: colors.gold,
            opacity: p.opacity,
            animation: `float-up ${p.dur} ${p.delay} ease-in infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Content */}
      <div style={s.inner}>
        {/* Title block */}
        <div style={s.titleBlock}>
          <h1 style={s.appName}>오늘, 하루</h1>
          <p style={s.tagline}>당신의 하루를 보관합니다.</p>
        </div>

        {/* Lock icon */}
        <div style={s.lockWrap} className="glow-pulse">
          <span style={s.lockIcon}>🔐</span>
        </div>

        {/* PIN dots + error */}
        <div style={s.pinSection}>
          <div ref={dotsRef} style={s.dots}>
            {Array.from({ length: PIN_LEN }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...s.dot,
                  ...(i < pin.length
                    ? hasError ? s.dotErr : s.dotFilled
                    : {}),
                }}
              />
            ))}
          </div>
          <p style={{ ...s.errMsg, opacity: errMsg ? 1 : 0 }}>{errMsg || '·'}</p>
        </div>

        {/* Keypad */}
        <PinKeypad onKeyPress={handleKey} onDelete={handleDel} />
      </div>

      {/* Unlock flash */}
      {unlocking && <div className="unlock-flash" />}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    height: '100vh',
    overflow: 'hidden',
    background: `
      radial-gradient(ellipse at 28% 22%, rgba(222,180,100,0.38) 0%, transparent 55%),
      radial-gradient(ellipse at 75% 75%, rgba(180,110,55,0.22) 0%, transparent 50%),
      linear-gradient(170deg, #C8A870 0%, #A07040 35%, #6A3E1E 100%)
    `,
    display: 'flex',
    flexDirection: 'column',
  },
  ray1: {
    position: 'absolute',
    top: '-20%',
    left: '10%',
    width: '120px',
    height: '140%',
    background: 'linear-gradient(180deg, rgba(255,230,150,0.14) 0%, transparent 100%)',
    transform: 'rotate(18deg)',
    pointerEvents: 'none',
    animation: 'light-ray 4s ease-in-out infinite',
  },
  ray2: {
    position: 'absolute',
    top: '-20%',
    left: '38%',
    width: '80px',
    height: '140%',
    background: 'linear-gradient(180deg, rgba(255,230,150,0.09) 0%, transparent 100%)',
    transform: 'rotate(8deg)',
    pointerEvents: 'none',
    animation: 'light-ray 6s 1.5s ease-in-out infinite',
  },
  inner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: '32px 24px 28px',
    position: 'relative',
    zIndex: 1,
  },
  titleBlock: { textAlign: 'center' },
  appName: {
    fontSize: '46px',
    fontWeight: '700',
    color: '#FDF6E8',
    letterSpacing: '5px',
    fontFamily: "'Noto Serif KR', serif",
    textShadow: '0 2px 20px rgba(212,168,85,0.5), 0 1px 4px rgba(0,0,0,0.3)',
    marginBottom: '10px',
  },
  tagline: {
    fontSize: '13px',
    color: 'rgba(253,246,232,0.7)',
    letterSpacing: '1px',
  },
  lockWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(253,246,232,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(6px)',
  },
  lockIcon: { fontSize: '36px', filter: 'drop-shadow(0 0 8px rgba(212,168,85,0.7))' },
  pinSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  dots: { display: 'flex', gap: '22px' },
  dot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid rgba(253,246,232,0.5)',
    backgroundColor: 'transparent',
    transition: 'all 0.18s ease',
  },
  dotFilled: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    boxShadow: `0 0 10px rgba(212,168,85,0.8), 0 0 20px rgba(212,168,85,0.35)`,
  },
  dotErr: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    boxShadow: `0 0 10px rgba(192,112,90,0.7)`,
  },
  errMsg: {
    fontSize: '13px',
    color: '#F0B0A0',
    letterSpacing: '0.3px',
    minHeight: '18px',
    transition: 'opacity 0.2s',
  },
};
