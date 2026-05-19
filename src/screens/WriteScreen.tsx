import React, { useRef, useState } from 'react';
import { colors } from '../constants/colors';
import { saveLetter, resizeImageFile } from '../storage/letterStorage';
import EmotionPicker from '../components/EmotionPicker';
import WeatherPicker from '../components/WeatherPicker';
import TagInput from '../components/TagInput';

interface Props { onBack: () => void; }

export default function WriteScreen({ onBack }: Props) {
  const [title,    setTitle]   = useState('');
  const [content,  setCont]    = useState('');
  const [emotion,  setEmo]     = useState('');
  const [weather,  setWea]     = useState('');
  const [tags,     setTags]    = useState<string[]>([]);
  const [image,    setImage]   = useState('');
  const [location, setLoc]     = useState('');
  const [capsule,  setCapsule] = useState(false);
  const [capsDate, setCapsDate]= useState('');
  const [saving,   setSaving]  = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCont(e.target.value);
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = textRef.current.scrollHeight + 'px';
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImage(await resizeImageFile(file));
    } catch {
      alert('이미지를 불러오지 못했어요.');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return; }
    if (!content.trim()) { alert('편지 내용을 적어주세요.'); return; }
    if (capsule && !capsDate) { alert('타임캡슐 열람 날짜를 설정해주세요.'); return; }
    setSaving(true);
    try {
      await saveLetter({
        id: Date.now().toString(),
        title:    title.trim(),
        content:  content.trim(),
        createdAt: new Date().toISOString(),
        emotion:  emotion || undefined,
        weather:  weather || undefined,
        tags:     tags.length ? tags : undefined,
        image:    image || undefined,
        location: location.trim() || undefined,
        timeCapsuleDate: capsule && capsDate ? new Date(capsDate).toISOString() : undefined,
      });
      onBack();
    } catch {
      alert('저장에 실패했어요.');
      setSaving(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  return (
    <div className="screen-slide" style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.headerBtn}>← 뒤로</button>
        <span style={s.headerTitle}>새 편지</span>
        <button onClick={handleSave} disabled={saving} style={{ ...s.saveBtn, opacity: saving ? 0.5 : 1 }}>
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>

      <div style={s.scroll}>
        {/* Meta section */}
        <div style={s.metaCard}>
          <EmotionPicker value={emotion} onChange={setEmo} />
          <div style={s.metaDivider} />
          <WeatherPicker value={weather} onChange={setWea} />
          <div style={s.metaDivider} />
          <TagInput tags={tags} onChange={setTags} />
          <div style={s.metaDivider} />

          {/* Location */}
          <div style={s.field}>
            <span style={s.fieldLabel}>장소</span>
            <input
              style={s.fieldInput}
              placeholder="오늘 있었던 곳 (선택)"
              value={location}
              onChange={(e) => setLoc(e.target.value)}
            />
          </div>

          {/* Photo */}
          <div style={s.field}>
            <span style={s.fieldLabel}>사진</span>
            <div style={s.photoRow}>
              {image ? (
                <div style={s.imgPreviewWrap}>
                  <img src={image} style={s.imgPreview} alt="첨부 이미지" />
                  <button onClick={() => setImage('')} style={s.imgRemove}>× 삭제</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} style={s.photoBtn}>
                  + 사진 첨부
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhoto}
              />
            </div>
          </div>

          {/* Time capsule */}
          <div style={s.field}>
            <label style={s.capsuleRow}>
              <span style={s.fieldLabel}>타임캡슐</span>
              <div
                onClick={() => setCapsule((v) => !v)}
                style={{ ...s.toggle, backgroundColor: capsule ? colors.accent : colors.border }}
              >
                <div style={{ ...s.toggleThumb, transform: capsule ? 'translateX(20px)' : 'translateX(2px)' }} />
              </div>
            </label>
            {capsule && (
              <input
                type="date"
                min={minDateStr}
                value={capsDate}
                onChange={(e) => setCapsDate(e.target.value)}
                style={s.dateInput}
              />
            )}
            {capsule && (
              <p style={s.capsuleHint}>설정한 날짜 이전에는 편지를 열 수 없어요.</p>
            )}
          </div>
        </div>

        {/* Paper writing area */}
        <div style={s.paper}>
          <div style={s.paperHeader}>
            <div style={s.hole} /><div style={s.hole} /><div style={s.hole} />
          </div>
          <input
            style={s.titleInput}
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
          />
          <div style={s.paperDivider} />
          <textarea
            ref={textRef}
            className="lined-paper"
            style={s.contentInput}
            placeholder="오늘 하루에 남기고 싶은 말을 적어주세요."
            value={content}
            onChange={handleContent}
          />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '13px 20px',
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: `0 2px 8px ${colors.shadow}`,
    flexShrink: 0,
  },
  headerBtn:   { fontSize: '14px', color: colors.textSub, padding: '4px 0', minWidth: '60px' },
  headerTitle: { fontSize: '16px', fontWeight: '600', color: colors.text, fontFamily: "'Noto Serif KR', serif" },
  saveBtn: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.accent,
    minWidth: '60px',
    textAlign: 'right',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  scroll: { flex: 1, overflowY: 'auto', padding: '16px' },
  metaCard: {
    backgroundColor: colors.card,
    borderRadius: '18px',
    border: `1px solid ${colors.borderLight}`,
    padding: '18px',
    marginBottom: '14px',
    boxShadow: `0 2px 12px ${colors.shadow}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  metaDivider: { height: '1px', backgroundColor: colors.borderLight },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldLabel: { fontSize: '12px', color: colors.textMuted, letterSpacing: '0.5px' },
  fieldInput: {
    fontSize: '14px',
    color: colors.text,
    padding: '10px 12px',
    borderRadius: '10px',
    border: `1px solid ${colors.borderLight}`,
    backgroundColor: `rgba(249,240,225,0.5)`,
  },
  photoRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  photoBtn: {
    padding: '9px 16px',
    borderRadius: '10px',
    border: `1px dashed ${colors.border}`,
    fontSize: '13px',
    color: colors.textSub,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  imgPreviewWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  imgPreview: { width: '120px', height: '90px', objectFit: 'cover', borderRadius: '10px', border: `1px solid ${colors.border}` },
  imgRemove:  { fontSize: '11px', color: colors.error, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' },
  capsuleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  toggle: {
    width: '44px',
    height: '26px',
    borderRadius: '13px',
    position: 'relative',
    transition: 'background-color 0.2s',
    flexShrink: 0,
    cursor: 'pointer',
  },
  toggleThumb: {
    position: 'absolute',
    top: '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    transition: 'transform 0.2s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },
  dateInput: {
    fontSize: '14px',
    color: colors.text,
    padding: '10px 12px',
    borderRadius: '10px',
    border: `1px solid ${colors.borderLight}`,
    backgroundColor: `rgba(249,240,225,0.5)`,
    width: '100%',
  },
  capsuleHint: { fontSize: '11px', color: colors.capsule, fontStyle: 'italic' },
  paper: {
    backgroundColor: colors.cardWarm,
    borderRadius: '18px',
    border: `1px solid ${colors.borderLight}`,
    overflow: 'hidden',
    boxShadow: `0 4px 20px ${colors.shadow}`,
    minHeight: '400px',
  },
  paperHeader: {
    display: 'flex',
    justifyContent: 'center',
    gap: '14px',
    padding: '10px 0',
    borderBottom: `1px solid ${colors.borderLight}`,
    backgroundColor: colors.surface,
    opacity: 0.8,
  },
  hole: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: colors.border },
  titleInput: {
    display: 'block',
    width: '100%',
    fontSize: '19px',
    fontWeight: '600',
    color: colors.text,
    padding: '16px 22px 10px',
    fontFamily: "'Noto Serif KR', serif",
  },
  paperDivider: { height: '1px', backgroundColor: colors.borderLight, margin: '0 22px' },
  contentInput: {
    display: 'block',
    width: '100%',
    fontSize: '14px',
    color: colors.text,
    padding: '14px 22px 22px',
    minHeight: '280px',
    lineHeight: '30px',
    overflow: 'hidden',
    fontFamily: "'Noto Serif KR', serif",
  },
};
