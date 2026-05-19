import React from 'react';
import { EMOTIONS } from '../types/letter';
import { colors } from '../constants/colors';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function EmotionPicker({ value, onChange }: Props) {
  return (
    <div style={s.wrap}>
      <span style={s.label}>오늘의 감정</span>
      <div style={s.row}>
        {EMOTIONS.map((e) => {
          const active = value === e.emoji;
          return (
            <button
              key={e.emoji}
              onClick={() => onChange(active ? '' : e.emoji)}
              style={{
                ...s.btn,
                backgroundColor: active ? `rgba(196,144,96,0.18)` : 'transparent',
                border: `1px solid ${active ? colors.accent : colors.borderLight}`,
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}
              title={e.label}
            >
              <span style={s.emoji}>{e.emoji}</span>
              <span style={{ ...s.emojiLabel, color: active ? colors.accent : colors.textMuted }}>
                {e.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
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
  emoji: { fontSize: '22px', lineHeight: 1 },
  emojiLabel: { fontSize: '10px', letterSpacing: '0.2px', transition: 'color 0.15s' },
};
