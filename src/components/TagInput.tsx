import React, { useState } from 'react';
import { colors } from '../constants/colors';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('');

  const add = (raw: string) => {
    const tag = raw.trim().replace(/^#/, '');
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
    if (e.key === 'Backspace' && !input && tags.length > 0)
      onChange(tags.slice(0, -1));
  };

  return (
    <div style={s.wrap}>
      <span style={s.label}>태그</span>
      <div style={s.box}>
        {tags.map((t, i) => (
          <span key={i} className="tag-chip">
            #{t}
            <button
              onClick={() => onChange(tags.filter((_, j) => j !== i))}
              style={s.remove}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => input && add(input)}
          placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
          style={s.input}
        />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap:  { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', color: colors.textMuted, letterSpacing: '0.5px' },
  box: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`,
    backgroundColor: `rgba(249,240,225,0.5)`,
    minHeight: '44px',
  },
  remove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: colors.textMuted,
    lineHeight: 1,
    padding: '0 2px',
    marginLeft: '2px',
  },
  input: {
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: colors.text,
    outline: 'none',
    minWidth: '100px',
    flex: 1,
  },
};
