import React, { useState } from 'react';
import { colors } from '../constants/colors';
import { deleteLetter, updateLetter } from '../storage/letterStorage';
import { Letter, isLocked } from '../types/letter';

interface Props {
  letter: Letter;
  onBack: () => void;
  onEdit: () => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function fmtFull(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일  ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function fmtShort(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function LetterDetailScreen({ letter: initial, onBack, onEdit }: Props) {
  const [letter, setLetter] = useState(initial);
  const locked = isLocked(letter);

  const toggleFav = async () => {
    const updated = { ...letter, isFavorite: !letter.isFavorite };
    setLetter(updated);
    await updateLetter(updated);
  };

  const handleDelete = async () => {
    if (!window.confirm('이 편지를 삭제할까요?\n삭제한 편지는 복구할 수 없어요.')) return;
    await deleteLetter(letter.id);
    onBack();
  };

  return (
    <div className="screen-zoom" style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>← 뒤로</button>
        <div style={s.headerActions}>
          <button
            onClick={toggleFav}
            style={{ ...s.iconBtn, color: letter.isFavorite ? colors.favorite : colors.textMuted }}
          >
            {letter.isFavorite ? '★' : '☆'}
          </button>
          {!locked && (
            <button onClick={onEdit} style={{ ...s.iconBtn, color: colors.textSub }}>
              수정
            </button>
          )}
          <button onClick={handleDelete} style={{ ...s.iconBtn, color: colors.error }}>
            삭제
          </button>
        </div>
      </div>

      <div style={s.scroll}>
        <div style={s.paper}>
          {/* Top seal */}
          <div style={s.seal}>
            <span style={s.sealIcon}>✉</span>
          </div>

          {/* Meta strip */}
          <div style={s.metaStrip}>
            <span style={s.metaDate}>{fmtFull(letter.createdAt)}</span>
            <div style={s.metaBadges}>
              {letter.emotion && <span style={s.metaBadge}>{letter.emotion}</span>}
              {letter.weather && <span style={s.metaBadge}>{letter.weather}</span>}
              {letter.location && (
                <span style={s.metaBadge}>📍 {letter.location}</span>
              )}
            </div>
          </div>

          {/* Tags */}
          {letter.tags && letter.tags.length > 0 && (
            <div style={s.tags}>
              {letter.tags.map((t) => (
                <span key={t} className="tag-chip">#{t}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 style={s.title}>{letter.title}</h2>
          <div style={s.divider} />

          {/* Locked state */}
          {locked ? (
            <div style={s.lockedBox}>
              <div style={s.lockedIcon}>🔒</div>
              <p style={s.lockedTitle}>아직 열 수 없는 편지예요.</p>
              <p style={s.lockedSub}>
                {fmtShort(letter.timeCapsuleDate!)} 이후<br />
                <strong style={{ color: colors.accent }}>{daysUntil(letter.timeCapsuleDate!)}일</strong> 후에 열람할 수 있어요.
              </p>
            </div>
          ) : (
            <p style={s.body} className="lined-paper">{letter.content}</p>
          )}

          {/* Footer */}
          {!locked && (
            <div style={s.footer}>
              <div style={s.footerLine} />
              <span style={s.footerSig}>오늘, 하루</span>
            </div>
          )}
        </div>

        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    backgroundColor: colors.bg,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '13px 20px',
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: `0 2px 8px ${colors.shadow}`,
    flexShrink: 0,
  },
  backBtn: { fontSize: '14px', color: colors.textSub, padding: '4px 0' },
  headerActions: { display: 'flex', gap: '16px', alignItems: 'center' },
  iconBtn: { fontSize: '18px', cursor: 'pointer', transition: 'color 0.15s', lineHeight: 1 },
  scroll: { flex: 1, overflowY: 'auto', padding: '20px 16px' },
  paper: {
    backgroundColor: colors.cardWarm,
    borderRadius: '20px',
    border: `1px solid ${colors.borderLight}`,
    overflow: 'hidden',
    boxShadow: `0 6px 28px ${colors.shadow}`,
  },
  seal: {
    display: 'flex',
    justifyContent: 'center',
    padding: '18px 0 12px',
    borderBottom: `1px solid ${colors.borderLight}`,
    backgroundColor: colors.surface,
  },
  sealIcon: { fontSize: '28px', opacity: 0.35 },
  metaStrip: {
    padding: '14px 22px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaDate:   { fontSize: '11px', color: colors.textMuted, letterSpacing: '0.3px', textAlign: 'right' },
  metaBadges: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  metaBadge: {
    fontSize: '13px',
    padding: '3px 8px',
    borderRadius: '8px',
    backgroundColor: `rgba(196,144,96,0.12)`,
    color: colors.textSub,
  },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 22px 10px' },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: colors.text,
    lineHeight: 1.4,
    padding: '0 22px 14px',
    fontFamily: "'Noto Serif KR', serif",
  },
  divider: { height: '1px', backgroundColor: colors.borderLight, margin: '0 22px 18px' },
  body: {
    fontSize: '14px',
    color: colors.text,
    lineHeight: '30px',
    padding: '2px 22px 24px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: "'Noto Serif KR', serif",
    letterSpacing: '0.2px',
  },
  lockedBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 22px',
    gap: '10px',
    textAlign: 'center',
  },
  lockedIcon:  { fontSize: '40px' },
  lockedTitle: { fontSize: '16px', fontWeight: '600', color: colors.text },
  lockedSub:   { fontSize: '13px', color: colors.textSub, lineHeight: '1.8' },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    padding: '0 22px 28px',
    marginTop: '32px',
  },
  footerLine: { width: '50px', height: '1px', backgroundColor: colors.border },
  footerSig: {
    fontSize: '13px',
    color: colors.textMuted,
    fontStyle: 'italic',
    letterSpacing: '1.5px',
    fontFamily: "'Noto Serif KR', serif",
  },
};
