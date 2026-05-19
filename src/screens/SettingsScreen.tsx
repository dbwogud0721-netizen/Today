import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../constants/colors';
import { getSettings, saveSettings, exportLetters, importLetters, subscribeLetters } from '../storage/letterStorage';
import BottomNav from '../components/BottomNav';
import type { TabScreen } from '../App';

interface Props {
  onTab: (t: TabScreen) => void;
  currentTab: TabScreen;
}

export default function SettingsScreen({ onTab, currentTab }: Props) {
  /* PIN change */
  const [pinStep,   setPinStep]   = useState<'idle'|'current'|'new'|'confirm'>('idle');
  const [pinInput,  setPinInput]  = useState('');
  const [newPin,    setNewPin]    = useState('');
  const [pinMsg,    setPinMsg]    = useState('');

  /* Import */
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  const [letterCount, setLetterCount] = useState(0);
  useEffect(() => subscribeLetters((ls) => setLetterCount(ls.length)), []);

  /* PIN flow */
  const startPinChange = () => { setPinStep('current'); setPinInput(''); setPinMsg(''); };
  const cancelPin = () => { setPinStep('idle'); setPinInput(''); setNewPin(''); setPinMsg(''); };

  const submitPin = () => {
    const { pin } = getSettings();
    if (pinStep === 'current') {
      if (pinInput !== pin) { setPinMsg('현재 비밀번호가 틀렸어요.'); setPinInput(''); return; }
      setPinStep('new'); setPinInput(''); setPinMsg('');
    } else if (pinStep === 'new') {
      if (pinInput.length < 4) { setPinMsg('4자리 이상 입력해주세요.'); return; }
      setNewPin(pinInput); setPinStep('confirm'); setPinInput(''); setPinMsg('');
    } else if (pinStep === 'confirm') {
      if (pinInput !== newPin) { setPinMsg('비밀번호가 일치하지 않아요.'); setPinInput(''); return; }
      saveSettings({ pin: newPin });
      setPinStep('idle'); setPinInput(''); setNewPin('');
      setPinMsg('✓ 비밀번호가 변경되었어요.');
      setTimeout(() => setPinMsg(''), 2500);
    }
  };

  /* Import */
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const count = await importLetters(ev.target!.result as string);
        setImportMsg(`✓ ${count}개의 편지를 불러왔어요.`);
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg('⚠ 파일 형식이 올바르지 않아요.');
        setTimeout(() => setImportMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (!window.confirm(`편지 ${letterCount}개가 모두 삭제됩니다.\n정말 초기화할까요?`)) return;
    localStorage.removeItem('today_haru_letters');
    window.location.reload();
  };

  const pinPlaceholder = {
    current: '현재 비밀번호 입력',
    new:     '새 비밀번호 입력 (4자 이상)',
    confirm: '새 비밀번호 확인',
    idle:    '',
  }[pinStep];

  return (
    <div style={s.container} className="screen-fade">
      <div style={s.header}>
        <h1 style={s.title}>설정</h1>
      </div>

      <div style={s.scroll}>
        {/* PIN */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>🔐 비밀번호</h2>
          {pinStep === 'idle' ? (
            <button onClick={startPinChange} style={s.rowBtn}>
              <span style={s.rowBtnLabel}>비밀번호 변경</span>
              <span style={s.chevron}>›</span>
            </button>
          ) : (
            <div style={s.pinForm}>
              <p style={s.pinStepLabel}>
                {pinStep === 'current' ? '현재 비밀번호 입력' :
                 pinStep === 'new'     ? '새 비밀번호 입력'    : '새 비밀번호 확인'}
              </p>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitPin()}
                placeholder={pinPlaceholder}
                style={s.pinInput}
                autoFocus
              />
              {pinMsg && (
                <p style={{ color: pinMsg.startsWith('✓') ? colors.success : colors.error, fontSize: '12px' }}>
                  {pinMsg}
                </p>
              )}
              <div style={s.pinBtns}>
                <button onClick={cancelPin}  style={s.cancelBtn}>취소</button>
                <button onClick={submitPin}  style={s.confirmBtn}>확인</button>
              </div>
            </div>
          )}
          {pinStep === 'idle' && pinMsg && (
            <p style={{ fontSize: '12px', color: colors.success, padding: '8px 0 0' }}>{pinMsg}</p>
          )}
        </div>

        {/* Data */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📦 데이터</h2>
          <p style={s.dataInfo}>{letterCount}개의 편지가 기기에 저장되어 있어요.</p>

          <button onClick={exportLetters} style={s.rowBtn}>
            <span style={s.rowBtnLabel}>데이터 내보내기 (JSON)</span>
            <span style={s.chevron}>↓</span>
          </button>

          <button onClick={() => fileRef.current?.click()} style={s.rowBtn}>
            <span style={s.rowBtnLabel}>데이터 가져오기</span>
            <span style={s.chevron}>↑</span>
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

          {importMsg && (
            <p style={{ fontSize: '12px', color: importMsg.startsWith('✓') ? colors.success : colors.error, padding: '6px 0' }}>
              {importMsg}
            </p>
          )}
        </div>

        {/* Reset */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>⚠️ 초기화</h2>
          <p style={s.dataInfo}>모든 편지가 삭제되며 복구할 수 없어요.</p>
          <button onClick={handleReset} style={s.resetBtn}>
            앱 데이터 초기화
          </button>
        </div>

        {/* About */}
        <div style={{ ...s.section, textAlign: 'center' }}>
          <p style={s.about}>오늘, 하루</p>
          <p style={s.aboutSub}>하루의 감정을 담는 비밀 편지함</p>
          <p style={s.aboutSub}>v2.0.0</p>
        </div>

        <div className="bottom-nav-spacer" />
      </div>

      <BottomNav currentTab={currentTab} onTab={onTab} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { height: '100vh', backgroundColor: colors.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '18px 20px 14px', backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}`, boxShadow: `0 2px 12px ${colors.shadow}`, flexShrink: 0 },
  title: { fontSize: '22px', fontWeight: '700', color: colors.text, letterSpacing: '1.5px', fontFamily: "'Noto Serif KR', serif" },
  scroll: { flex: 1, overflowY: 'auto', padding: '18px 16px' },
  section: {
    backgroundColor: colors.card,
    borderRadius: '16px',
    border: `1px solid ${colors.borderLight}`,
    padding: '18px',
    marginBottom: '14px',
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: colors.text, marginBottom: '14px', fontFamily: "'Noto Serif KR', serif" },
  rowBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 0',
    borderBottom: `1px solid ${colors.borderLight}`,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
  } as React.CSSProperties,
  rowBtnLabel: { fontSize: '14px', color: colors.text },
  chevron:     { fontSize: '18px', color: colors.textMuted },
  pinForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  pinStepLabel: { fontSize: '12px', color: colors.textMuted },
  pinInput: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    fontSize: '14px',
    color: colors.text,
    letterSpacing: '3px',
  },
  pinBtns:   { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '14px', color: colors.textSub, cursor: 'pointer', backgroundColor: 'transparent' },
  confirmBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: '600', color: colors.white, cursor: 'pointer', backgroundColor: colors.accent },
  dataInfo: { fontSize: '12px', color: colors.textMuted, marginBottom: '12px' },
  resetBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: `1px solid ${colors.error}`,
    fontSize: '14px',
    fontWeight: '500',
    color: colors.error,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    marginTop: '4px',
  },
  about:    { fontSize: '20px', fontWeight: '700', color: colors.text, fontFamily: "'Noto Serif KR', serif", letterSpacing: '2px', marginBottom: '6px' },
  aboutSub: { fontSize: '12px', color: colors.textMuted, lineHeight: '1.8' },
};
