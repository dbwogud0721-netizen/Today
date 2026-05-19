import React, { useEffect, useMemo, useState } from 'react';
import { colors } from '../constants/colors';
import { getLetters } from '../storage/letterStorage';
import { Letter } from '../types/letter';
import LetterCard from '../components/LetterCard';
import BottomNav from '../components/BottomNav';
import type { TabScreen } from '../App';

interface Props {
  onWrite: () => void;
  onOpen: (l: Letter) => void;
  onTab: (t: TabScreen) => void;
  currentTab: TabScreen;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
type Filter = 'all' | 'favorite' | 'capsule';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
}

export default function HomeScreen({ onWrite, onOpen, onTab, currentTab }: Props) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [filter, setFilter]   = useState<Filter>('all');
  const [search, setSearch]   = useState('');

  useEffect(() => { setLetters(getLetters()); }, []);
  const refresh = () => setLetters(getLetters());

  const filtered = useMemo(() => {
    let list = letters;
    if (filter === 'favorite') list = list.filter((l) => l.isFavorite);
    if (filter === 'capsule')  list = list.filter((l) => !!l.timeCapsuleDate);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.content.toLowerCase().includes(q) ||
          l.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [letters, filter, search]);

  return (
    <div style={s.container} className="screen-fade">
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <h1 style={s.appName}>오늘, 하루</h1>
            <p style={s.date}>{getTodayStr()}</p>
          </div>
          <p style={s.count}>{letters.length}통의 편지</p>
        </div>
        <p style={s.greeting}>오늘은 어떤 마음이었나요?</p>

        {/* Search bar */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>◎</span>
          <input
            style={s.searchInput}
            placeholder="편지 검색…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={s.clearBtn}>×</button>
          )}
        </div>

        {/* Filter chips */}
        <div style={s.filters}>
          {(['all', 'favorite', 'capsule'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...s.chip,
                backgroundColor: filter === f ? colors.accent : 'transparent',
                color: filter === f ? colors.white : colors.textSub,
                border: `1px solid ${filter === f ? colors.accent : colors.border}`,
              }}
            >
              {f === 'all' ? '전체' : f === 'favorite' ? '★ 즐겨찾기' : '🔒 타임캡슐'}
            </button>
          ))}
        </div>

        <div style={s.divider} />
      </div>

      {/* List */}
      <div style={s.list}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✉️</div>
            <p style={s.emptyText}>
              {search ? '검색 결과가 없어요.' :
               filter === 'favorite' ? '즐겨찾기한 편지가 없어요.' :
               filter === 'capsule'  ? '타임캡슐 편지가 없어요.' :
               '첫 편지를 남겨보세요.'}
            </p>
            {!search && filter === 'all' && (
              <p style={s.emptySub}>오늘의 감정을 기록해보세요.</p>
            )}
          </div>
        ) : (
          filtered.map((l) => (
            <LetterCard key={l.id} letter={l} onPress={() => onOpen(l)} onRefresh={refresh} />
          ))
        )}
        <div className="bottom-nav-spacer" />
      </div>

      {/* FAB */}
      <button
        style={s.fab}
        onClick={onWrite}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <span style={s.fabIcon}>+</span>
      </button>

      <BottomNav currentTab={currentTab} onTab={onTab} />
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
    padding: '18px 20px 0',
    flexShrink: 0,
    backgroundColor: colors.surface,
    boxShadow: `0 2px 12px ${colors.shadow}`,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  appName: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.text,
    letterSpacing: '2.5px',
    fontFamily: "'Noto Serif KR', serif",
    textShadow: `0 1px 3px ${colors.shadow}`,
  },
  date:  { fontSize: '11px', color: colors.textMuted, letterSpacing: '0.3px', marginTop: '3px' },
  count: { fontSize: '12px', color: colors.textMuted, marginTop: '6px' },
  greeting: { fontSize: '14px', color: colors.textSub, marginBottom: '14px' },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.card,
    borderRadius: '12px',
    border: `1px solid ${colors.borderLight}`,
    padding: '9px 14px',
    marginBottom: '12px',
  },
  searchIcon:  { fontSize: '14px', color: colors.textMuted },
  searchInput: { flex: 1, fontSize: '13px', color: colors.text, background: 'transparent' },
  clearBtn: {
    fontSize: '16px',
    color: colors.textMuted,
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 2px',
  },
  filters: { display: 'flex', gap: '8px', marginBottom: '14px' },
  chip: {
    fontSize: '12px',
    padding: '5px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
  },
  divider: { height: '1px', backgroundColor: colors.border, margin: '0 -20px' },
  list: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '14px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '280px',
    gap: '8px',
  },
  emptyIcon: { fontSize: '48px', opacity: 0.5, marginBottom: '8px' },
  emptyText: { fontSize: '16px', fontWeight: '500', color: colors.text },
  emptySub:  { fontSize: '13px', color: colors.textMuted },
  fab: {
    position: 'fixed',
    bottom: '80px',
    right: `max(20px, calc(50vw - 215px + 20px))`,
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.goldLight}, ${colors.accent})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 6px 20px rgba(180,110,40,0.45)`,
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    zIndex: 50,
    border: 'none',
  },
  fabIcon: {
    fontSize: '30px',
    color: colors.white,
    fontWeight: '300',
    lineHeight: 1,
    marginTop: '-2px',
  },
  white: { color: colors.white },
};
