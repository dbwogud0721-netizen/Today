import React from 'react';
import { WEATHERS } from '../types/letter';
import { colors } from '../constants/colors';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function WeatherPicker({ value, onChange }: Props) {
  return (
    <div style={s.wrap}>
      <span style={s.label}>오늘의 날씨</span>
      <div style={s.row}>
        {WEATHERS.map((w) => {
          const active = value === w.emoji;
          return (
            <button
              key={w.emoji}
              onClick={() => onChange(active ? '' : w.emoji)}
              style={{
                ...s.btn,
                backgroundColor: active ? `rgba(196,144,96,0.18)` : 'transparent',
                border: `1px solid ${active ? colors.accent : colors.borderLight}`,
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}
              title={w.label}
            >
              <span style={s.emoji}>{w.emoji}</span>
              <span style={{ ...s.wLabel, color: active ? colors.accent : colors.textMuted }}>
                {w.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', color: colors.textMuted, letterSpacing: '0.5px' },
  row: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '4px',
    scrollbarWidth: 'none',
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '8px 10px',
    borderRadius: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  emoji:  { fontSize: '22px', lineHeight: 1 },
  wLabel: { fontSize: '10px', letterSpacing: '0.2px', transition: 'color 0.15s' },
};
