import { useEffect, useState, useCallback } from 'react';
import LockScreen from './screens/LockScreen';
import HomeScreen from './screens/HomeScreen';
import WriteScreen from './screens/WriteScreen';
import LetterDetailScreen from './screens/LetterDetailScreen';
import SearchScreen from './screens/SearchScreen';
import StatsScreen from './screens/StatsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Letter } from './types/letter';
import { migrateFromLocalStorage } from './storage/letterStorage';

export type TabScreen = 'home' | 'search' | 'stats' | 'settings';

export type Screen =
  | { name: 'lock' }
  | { name: TabScreen }
  | { name: 'write' }
  | { name: 'edit'; letter: Letter; from: TabScreen }
  | { name: 'detail'; letter: Letter; from: TabScreen };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'lock' });
  const [homeKey, setHomeKey] = useState(0);

  useEffect(() => { void migrateFromLocalStorage(); }, []);

  const navigate = useCallback((s: Screen) => {
    if (s.name === 'home') setHomeKey((k) => k + 1);
    setScreen(s);
  }, []);

  const goTab = useCallback(
    (t: TabScreen) => navigate({ name: t }),
    [navigate]
  );

  if (screen.name === 'lock') {
    return <LockScreen onUnlock={() => navigate({ name: 'home' })} />;
  }
  if (screen.name === 'home') {
    return (
      <HomeScreen
        key={homeKey}
        onWrite={() => navigate({ name: 'write' })}
        onOpen={(l: Letter) => navigate({ name: 'detail', letter: l, from: 'home' })}
        onTab={goTab}
        currentTab="home"
      />
    );
  }
  if (screen.name === 'search') {
    return (
      <SearchScreen
        onOpen={(l: Letter) => navigate({ name: 'detail', letter: l, from: 'search' })}
        onTab={goTab}
        currentTab="search"
      />
    );
  }
  if (screen.name === 'stats') {
    return <StatsScreen onTab={goTab} currentTab="stats" />;
  }
  if (screen.name === 'settings') {
    return <SettingsScreen onTab={goTab} currentTab="settings" />;
  }
  if (screen.name === 'write') {
    return <WriteScreen onBack={() => navigate({ name: 'home' })} />;
  }
  if (screen.name === 'edit') {
    return (
      <WriteScreen
        initialLetter={screen.letter}
        onBack={() => navigate({ name: 'detail', letter: screen.letter, from: screen.from })}
        onSave={(updated) => navigate({ name: 'detail', letter: updated, from: screen.from })}
      />
    );
  }
  if (screen.name === 'detail') {
    return (
      <LetterDetailScreen
        letter={screen.letter}
        onBack={() => navigate({ name: screen.from })}
        onEdit={() => navigate({ name: 'edit', letter: screen.letter, from: screen.from })}
      />
    );
  }
  return null;
}
