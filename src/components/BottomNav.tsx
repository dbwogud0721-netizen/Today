import React from 'react';
import { colors } from '../constants/colors';
import type { TabScreen } from '../App';

interface Props {
  currentTab: TabScreen;
  onTab: (t: TabScreen) => void;
}

const TABS: { id: TabScreen; icon: string; label: string }[] = [
  { id: 'home',     icon: '✉',  label: '편지함' },
  { id: 'search',   icon: '◎',  label: '검색'   },
  { id: 'stats',    icon: '◈',  label: '통계'   },
  { id: 'settings', icon: '◉',  label: '설정'   },
];

export default function BottomNav({ currentTab, onTab }: Props) {
  return (
    <div style={s.nav}>
      {TABS.map((tab) => {
        const active = tab.id === currentTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTab(tab.id)}
            style={{ ...s.tab, color: active ? colors.accent : colors.textMuted }}
          >
            <span style={{ ...s.icon, fontSize: active ? '20px' : '18px' }}>
              {tab.icon}
            </span>
            <span style={{ ...s.label, fontWeight: active ? '600' : '400' }}>
              {tab.label}
            </span>
            {active && <div style={s.dot} />}
          </button>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    height: '64px',
    backgroundColor: colors.card,
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    boxShadow: '0 -4px 20px rgba(70,38,12,0.1)',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    height: '100%',
    position: 'relative',
    transition: 'color 0.2s ease',
  },
  icon: {
    lineHeight: 1,
    transition: 'font-size 0.15s ease',
  },
  label: {
    fontSize: '10px',
    letterSpacing: '0.3px',
    transition: 'font-weight 0.15s ease',
  },
  dot: {
    position: 'absolute',
    bottom: '6px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: colors.accent,
  },
};
