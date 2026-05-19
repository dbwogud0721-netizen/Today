import React, { useState } from 'react';
import { colors } from '../constants/colors';

interface Props {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const SIZE = 80;

export default function PinKeypad({ onKeyPress, onDelete }: Props) {
  const [pressed, setPressed] = useState<string | null>(null);

  const handlePress = (key: string) => {
    if (!key) return;
    setPressed(key);
    setTimeout(() => setPressed(null), 140);
    if (key === '⌫') onDelete();
    else onKeyPress(key);
  };

  return (
    <div style={s.grid}>
      {KEYS.map((key, i) => {
        const empty   = key === '';
        const isBack  = key === '⌫';
        const active  = pressed === key;
        return (
          <button
            key={i}
            onClick={() => handlePress(key)}
            disabled={empty}
            style={{
              ...s.key,
              ...(empty ? s.hidden : {}),
              ...(active ? s.keyActive : {}),
              boxShadow: active
                ? `0 0 0 0 transparent`
                : `0 4px 14px rgba(70,38,12,0.18), 0 0 0 1px rgba(196,144,96,0.2)`,
            }}
          >
            <span style={isBack ? s.backText : s.keyText}>{key}</span>
          </button>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(3, ${SIZE}px)`,
    gap: '16px',
    justifyContent: 'center',
  },
  key: {
    width:  `${SIZE}px`,
    height: `${SIZE}px`,
    borderRadius: '50%',
    backgroundColor: `rgba(249,240,225,0.88)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease',
    backdropFilter: 'blur(4px)',
  },
  keyActive: {
    backgroundColor: `rgba(212,168,85,0.35)`,
    transform: 'scale(0.92)',
  },
  hidden: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    pointerEvents: 'none',
    cursor: 'default',
  },
  keyText: {
    fontSize: '22px',
    fontWeight: '500',
    color: colors.text,
    lineHeight: 1,
    fontFamily: "'Noto Serif KR', serif",
  },
  backText: {
    fontSize: '18px',
    color: colors.textSub,
    lineHeight: 1,
  },
};
