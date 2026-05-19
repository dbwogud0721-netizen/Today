import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../constants/colors';
import { getLetters } from '../storage/letterStorage';
import { Letter, EMOTIONS, WEATHERS } from '../types/letter';
import LetterCard from '../components/LetterCard';
import BottomNav from '../components/BottomNav';
import type { TabScreen } from '../App';

interface Props {
  onOpen: (l: Letter) => void;
  onTab:  (t: TabScreen) => void;
  currentTab: TabScreen;
}

export default function SearchScreen({ onOpen, onTab, currentTab }: Props) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [query,   setQuery]   = useState('');
  const [emoFilter, setEmo]   = useState('');
  const [weaFilter, setWea]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLetters(getLetters());
    inputRef.current?.focus();
  }, []);

  const refresh = () => setLetters(getLetters());

  const results = useMemo(() => {
    let list = letters;
    if (emoFilter) list = list.filter((l) => l.emotion === emoFilter);
    if (weaFilter) list = list.filter((l) => l.weather === weaFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.content.toLowerCase().includes(q) ||
          l.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [letters, query, emoFilter, weaFilter]);

  return (
    <div style={s.container} className="screen-fade">
      {/* Search bar */}
      <div style={s.header}>
        <h1 style={s.title}>검색</h1>
        <div style={s.searchBox}>
          <span style={s.searchIco}>◎</span>
          <input
            ref={inputRef}
            style={s.searchInput}
            placeholder="제목, 내용, 태그 검색…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} style={s.clearBtn}>×</button>
          )}
        </div>

        {/* Emotion filter */}
        <div style={s.filterRow}>
          <span style={s.filterLabel}>감정</span>
          <div style={s.filterScroll}>
            {EMOTIONS.map((e) => (
              <button
                key={e.emoji}
                onClick={() => setEmo(emoFilter === e.emoji ? '' : e.emoji)}
                style={{
                  ...s.filterChip,
                  backgroundColor: emoFilter === e.emoji ? `rgba(196,144,96,0.2)` : 'transparent',
                  border: `1px solid ${emoFilter === e.emoji ? colors.accent : colors.borderLight}`,
                }}
              >
                {e.emoji} {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weather filter */}
        <div style={s.filterRow}>
          <span style={s.filterLabel}>날씨</span>
          <div style={s.filterScroll}>
            {WEATHERS.map((w) => (
              <button
                key={w.emoji}
                onClick={() => setWea(weaFilter === w.emoji ? '' : w.emoji)}
                style={{
                  ...s.filterChip,
                  backgroundColor: weaFilter === w.emoji ? `rgba(196,144,96,0.2)` : 'transparent',
                  border: `1px solid ${weaFilter === w.emoji ? colors.accent : colors.borderLight}`,
                }}
              >
                {w.emoji} {w.label}
              </button>
            ))}
          </div>
        </div>

        <div style={s.divider} />
      </div>

      {/* Results */}
      <div style={s.list}>
        {(query || emoFilter || weaFilter) ? (
          results.length > 0 ? (
            <>
              <p style={s.resultCount}>{results.length}개의 편지</p>
              {results.map((l) => (
                <LetterCard key={l.id} letter={l} onPress={() => onOpen(l)} onRefresh={refresh} />
              ))}
            </>
          ) : (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🔍</div>
              <p style={s.emptyText}>검색 결과가 없어요.</p>
            </div>
          )
        ) : (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✦</div>
            <p style={s.emptyText}>검색어나 필터를 입력해보세요.</p>
          </div>
        )}
        <div className="bottom-nav-spacer" />
      </div>

      <BottomNav currentTab={currentTab} onTab={onTab} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { height: '100vh', backgroundColor: colors.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '18px 20px 0', backgroundColor: colors.surface, boxShadow: `0 2px 12px ${colors.shadow}`, flexShrink: 0 },
  title: { fontSize: '22px', fontWeight: '700', color: colors.text, letterSpacing: '1.5px', fontFamily: "'Noto Serif KR', serif", marginBottom: '14px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: colors.card, borderRadius: '12px', border: `1px solid ${colors.borderLight}`, padding: '10px 14px', marginBottom: '12px' },
  searchIco:   { fontSize: '14px', color: colors.textMuted },
  searchInput: { flex: 1, fontSize: '14px', color: colors.text, background: 'transparent' },
  clearBtn:    { fontSize: '16px', color: colors.textMuted, cursor: 'pointer', lineHeight: 1 },
  filterRow:  { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  filterLabel:{ fontSize: '11px', color: colors.textMuted, flexShrink: 0, letterSpacing: '0.5px' },
  filterScroll: { display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' },
  filterChip: { fontSize: '12px', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', color: colors.textSub, transition: 'all 0.15s' },
  divider:    { height: '1px', backgroundColor: colors.border, margin: '4px -20px 0' },
  list:       { flex: 1, overflowY: 'auto', paddingTop: '14px' },
  resultCount: { fontSize: '12px', color: colors.textMuted, padding: '0 20px 10px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '8px' },
  emptyIcon: { fontSize: '40px', opacity: 0.4, marginBottom: '6px' },
  emptyText: { fontSize: '14px', color: colors.textSub },
};
