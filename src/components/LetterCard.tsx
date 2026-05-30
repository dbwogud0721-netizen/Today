import React, { useState } from 'react';
import { Letter, isLocked } from '../types/letter';
import { colors } from '../constants/colors';
import { updateLetter } from '../storage/letterStorage';

interface Props {
  letter: Letter;
  onPress: () => void;
  onRefresh?: () => void; // kept for API compatibility
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function LetterCard({ letter, onPress }: Props) {
  const [hov, setHov] = useState(false);
  const locked = isLocked(letter);

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    void updateLetter({ ...letter, isFavorite: !letter.isFavorite });
  };

  const preview = letter.content.length > 65
    ? letter.content.slice(0, 65) + '…'
    : letter.content;

  return (
    <div
      className="card-fold"
      onClick={locked ? undefined : onPress}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...s.card,
        cursor: locked ? 'default' : 'pointer',
        transform: hov && !locked ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov && !locked
          ? `0 10px 30px ${colors.shadow}, 0 2px 0 ${colors.border}`
          : `0 4px 16px ${colors.shadow}, 0 1px 0 ${colors.border}`,
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        ...s.stripe,
        background: locked
          ? `linear-gradient(90deg, ${colors.capsule}, #BFA882)`
          : `linear-gradient(90deg, ${colors.accent}, ${colors.goldLight})`,
      }} />

      <div style={s.body}>
        {/* Header row */}
        <div style={s.row}>
          <div style={s.titleWrap}>
            {locked && <span style={s.lockIcon}>🔒</span>}
            <span style={s.title}>{letter.title}</span>
          </div>
          <div style={s.rightMeta}>
            <span style={s.date}>{fmtDate(letter.createdAt)}</span>
            <button
              onClick={toggleFav}
              style={{ ...s.favBtn, color: letter.isFavorite ? colors.favorite : colors.border }}
              title={letter.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
            >
              {letter.isFavorite ? '★' : '☆'}
            </button>
          </div>
        </div>

        {/* Meta badges */}
        <div style={s.badges}>
          {letter.emotion && <span style={s.badge}>{letter.emotion}</span>}
          {letter.weather && <span style={s.badge}>{letter.weather}</span>}
          {letter.location && (
            <span style={{ ...s.badge, ...s.locBadge }}>📍 {letter.location}</span>
          )}
          {letter.timeCapsuleDate && (
            <span style={{ ...s.badge, ...s.capsBadge }}>
              🔒 {fmtDate(letter.timeCapsuleDate)}
            </span>
          )}
        </div>

        {/* Preview or locked message */}
        {locked ? (
          <p style={s.lockedMsg}>
            {fmtDate(letter.timeCapsuleDate!)} 이후에 열람할 수 있어요.
          </p>
        ) : (
          <p style={s.preview}>{preview}</p>
        )}

        {/* Tags */}
        {letter.tags && letter.tags.length > 0 && (
          <div style={s.tags}>
            {letter.tags.map((t) => (
              <span key={t} className="tag-chip">#{t}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={s.footer}>
          <span style={s.stamp}>✉</span>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    margin: '0 18px 14px',
    overflow: 'hidden',
    border: `1px solid ${colors.borderLight}`,
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    position: 'relative',
  },
  stripe: { height: '3px' },
  body:   { padding: '14px 16px 12px' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '8px',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
    overflow: 'hidden',
  },
  lockIcon: { fontSize: '13px', flexShrink: 0 },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: colors.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: "'Noto Serif KR', serif",
  },
  rightMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  date: { fontSize: '11px', color: colors.textMuted, letterSpacing: '0.2px' },
  favBtn: {
    fontSize: '16px',
    lineHeight: 1,
    cursor: 'pointer',
    transition: 'color 0.15s',
    padding: '2px',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '8px',
  },
  badge: {
    fontSize: '14px',
    lineHeight: 1.2,
    padding: '2px 6px',
    borderRadius: '8px',
    backgroundColor: `rgba(196,144,96,0.1)`,
  },
  locBadge: {
    fontSize: '11px',
    color: colors.textSub,
    backgroundColor: `rgba(196,144,96,0.1)`,
  },
  capsBadge: {
    fontSize: '11px',
    color: colors.capsule,
    backgroundColor: `rgba(139,110,69,0.1)`,
  },
  preview: {
    fontSize: '13px',
    color: colors.textSub,
    lineHeight: '1.65',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  lockedMsg: {
    fontSize: '12px',
    color: colors.capsule,
    fontStyle: 'italic',
    lineHeight: '1.5',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  imgIcon: { fontSize: '13px', opacity: 0.5 },
  stamp:   { fontSize: '15px', opacity: 0.25, marginLeft: 'auto' },
};
