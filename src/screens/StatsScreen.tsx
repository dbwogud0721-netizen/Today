import React, { useEffect, useState } from 'react';
import { colors } from '../constants/colors';
import { subscribeLetters } from '../storage/letterStorage';
import { Letter, EMOTIONS } from '../types/letter';
import BottomNav from '../components/BottomNav';
import type { TabScreen } from '../App';

interface Props {
  onTab: (t: TabScreen) => void;
  currentTab: TabScreen;
}

function getMonthStr(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function StatsScreen({ onTab, currentTab }: Props) {
  const [letters, setLetters] = useState<Letter[]>([]);
  useEffect(() => subscribeLetters(setLetters), []);

  const total    = letters.length;
  const favCount = letters.filter((l) => l.isFavorite).length;
  const capsCount= letters.filter((l) => l.timeCapsuleDate).length;

  /* Emotion distribution */
  const emotionCounts = EMOTIONS.map((e) => ({
    ...e,
    count: letters.filter((l) => l.emotion === e.emoji).length,
  })).sort((a, b) => b.count - a.count);
  const maxEmo = Math.max(...emotionCounts.map((e) => e.count), 1);

  /* Monthly activity (last 6 months) */
  const monthMap: Record<string, number> = {};
  letters.forEach((l) => {
    const m = getMonthStr(l.createdAt);
    monthMap[m] = (monthMap[m] || 0) + 1;
  });
  const months = Object.entries(monthMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .reverse();
  const maxMonth = Math.max(...months.map(([, c]) => c), 1);

  return (
    <div style={s.container} className="screen-fade">
      <div style={s.header}>
        <h1 style={s.title}>통계</h1>
        <p style={s.sub}>나의 감정 기록</p>
      </div>

      <div style={s.scroll}>
        {/* Summary cards */}
        <div style={s.summaryRow}>
          {[
            { label: '총 편지', value: total,    icon: '✉' },
            { label: '즐겨찾기', value: favCount, icon: '★' },
            { label: '타임캡슐', value: capsCount,icon: '🔒' },
          ].map((item) => (
            <div key={item.label} style={s.summaryCard}>
              <span style={s.summaryIcon}>{item.icon}</span>
              <span style={s.summaryValue}>{item.value}</span>
              <span style={s.summaryLabel}>{item.label}</span>
            </div>
          ))}
        </div>

        {total === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <p style={s.emptyText}>아직 편지가 없어요.</p>
            <p style={s.emptySub}>편지를 작성하면 통계가 표시됩니다.</p>
          </div>
        ) : (
          <>
            {/* Emotion chart */}
            <div style={s.section}>
              <h2 style={s.sectionTitle}>감정 분포</h2>
              <div style={s.chart}>
                {emotionCounts.filter((e) => e.count > 0).map((e) => (
                  <div key={e.emoji} style={s.barRow}>
                    <span style={s.barEmoji}>{e.emoji}</span>
                    <span style={s.barLabel}>{e.label}</span>
                    <div style={s.barTrack}>
                      <div
                        style={{
                          ...s.barFill,
                          width: `${(e.count / maxEmo) * 100}%`,
                        }}
                      />
                    </div>
                    <span style={s.barCount}>{e.count}</span>
                  </div>
                ))}
                {emotionCounts.every((e) => e.count === 0) && (
                  <p style={s.noData}>감정을 기록한 편지가 없어요.</p>
                )}
              </div>
            </div>

            {/* Monthly activity */}
            {months.length > 0 && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>월별 기록</h2>
                <div style={s.monthChart}>
                  {months.map(([month, count]) => (
                    <div key={month} style={s.monthCol}>
                      <div style={s.monthBarWrap}>
                        <div
                          style={{
                            ...s.monthBar,
                            height: `${(count / maxMonth) * 80}px`,
                          }}
                        />
                      </div>
                      <span style={s.monthLabel}>{month.slice(5)}</span>
                      <span style={s.monthCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
  sub: { fontSize: '12px', color: colors.textMuted, marginTop: '3px' },
  scroll: { flex: 1, overflowY: 'auto', padding: '18px 16px' },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: '14px',
    border: `1px solid ${colors.borderLight}`,
    padding: '14px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  summaryIcon:  { fontSize: '20px' },
  summaryValue: { fontSize: '22px', fontWeight: '700', color: colors.text, fontFamily: "'Noto Serif KR', serif" },
  summaryLabel: { fontSize: '10px', color: colors.textMuted, letterSpacing: '0.3px' },
  section: { backgroundColor: colors.card, borderRadius: '16px', border: `1px solid ${colors.borderLight}`, padding: '18px', marginBottom: '16px', boxShadow: `0 2px 10px ${colors.shadow}` },
  sectionTitle: { fontSize: '15px', fontWeight: '600', color: colors.text, marginBottom: '16px', fontFamily: "'Noto Serif KR', serif" },
  chart: { display: 'flex', flexDirection: 'column', gap: '10px' },
  barRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  barEmoji: { fontSize: '16px', width: '22px', textAlign: 'center', flexShrink: 0 },
  barLabel: { fontSize: '12px', color: colors.textSub, width: '44px', flexShrink: 0 },
  barTrack: { flex: 1, height: '10px', borderRadius: '5px', backgroundColor: colors.borderLight, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '5px', background: `linear-gradient(90deg, ${colors.accent}, ${colors.goldLight})`, transition: 'width 0.6s ease' },
  barCount: { fontSize: '12px', color: colors.textMuted, width: '24px', textAlign: 'right', flexShrink: 0 },
  monthChart: { display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '0 4px' },
  monthCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  monthBarWrap: { height: '90px', display: 'flex', alignItems: 'flex-end' },
  monthBar: { width: '28px', borderRadius: '4px 4px 0 0', background: `linear-gradient(180deg, ${colors.goldLight}, ${colors.accent})`, minHeight: '4px', transition: 'height 0.5s ease' },
  monthLabel: { fontSize: '10px', color: colors.textMuted },
  monthCount: { fontSize: '11px', color: colors.textSub, fontWeight: '600' },
  noData: { fontSize: '13px', color: colors.textMuted, textAlign: 'center', padding: '10px 0' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '8px' },
  emptyIcon: { fontSize: '44px', opacity: 0.4, marginBottom: '8px' },
  emptyText: { fontSize: '15px', fontWeight: '500', color: colors.text },
  emptySub:  { fontSize: '12px', color: colors.textMuted },
};
