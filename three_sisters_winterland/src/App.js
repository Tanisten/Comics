import { useEffect, useMemo, useRef, useState } from 'react';
import AppContent from './Components/AppContent.jsx';
import './App.css';
import prologue from './chapters/prologue.js';
import chapter1 from './chapters/chapter_1.js';

const scenes = {
  home: {
    id: 'home',
    title: 'Северный путь',
    text: 'История двух сестёр в суровом северном мире.',
    hero: true,
    options: [{ id: 'start', label: 'Играть', next: 'intro' }],
  },
  intro: {
    id: 'intro',
    title: 'Выбор сестры',
    text:
      'Выберите, за кого начать историю. Второй игрок идёт по тем же сценам, но его выборы становятся серыми.',
    options: [
      { id: 'aidai', label: 'Играть за Айдай' },
      { id: 'elina', label: 'Играть за Элину' },
    ],
  },
  ...prologue,
  ...chapter1,
};

const assetLoaders = {
  homeHero: () => import('./assets/northern-path-hero.gif'),
  aidai: () => import('./assets/aidai.png'),
  elina: () => import('./assets/elina.png'),
  meet: () => import('./assets/meet.png'),
  tavern: () => import('./assets/tavern.png'),
  tavern2: () => import('./assets/tavern2.png'),
};

const sceneAssets = {
  home: [assetLoaders.homeHero],
  intro: [assetLoaders.aidai, assetLoaders.elina],
  S10: [assetLoaders.meet],
  T0: [assetLoaders.tavern],
  T7: [assetLoaders.tavern2],
};

const imageModuleCache = new Map();
const imagePreloadCache = new Map();

const loadImageModule = (loader) => {
  if (!loader) return Promise.resolve(null);
  if (imageModuleCache.has(loader)) return imageModuleCache.get(loader);
  const promise = loader().then((mod) => mod?.default ?? mod);
  imageModuleCache.set(loader, promise);
  return promise;
};

const preloadImage = (loader) => {
  if (!loader) return Promise.resolve(null);
  if (imagePreloadCache.has(loader)) return imagePreloadCache.get(loader);
  const promise = loadImageModule(loader).then(
    (src) =>
      new Promise((resolve) => {
        if (!src) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(src);
        img.src = src;
      })
  );
  imagePreloadCache.set(loader, promise);
  return promise;
};

const runIdle = (cb) => {
  if (typeof window === 'undefined') {
    const id = setTimeout(cb, 200);
    return () => clearTimeout(id);
  }
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(cb, { timeout: 1000 });
    return () => window.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
};

const useSceneImage = (loaderOrNull) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!loaderOrNull) {
      setSrc(null);
      return () => {
        cancelled = true;
      };
    }
    loadImageModule(loaderOrNull).then((loadedSrc) => {
      if (!cancelled) setSrc(loadedSrc);
    });
    return () => {
      cancelled = true;
    };
  }, [loaderOrNull]);

  return src;
};

const starterFlags = {
  game_started: false,
  player1: false,
  player2: false,
  prologue_started: false,
  alarm_raised_by_player2: false,
  sisters_united: false,
  north_silence_noted: false,
  war_preparations_reported: false,
  report_sent_to_elven_high_lord: false,
};

function App() {
  const [currentId, setCurrentId] = useState('home');
  const [flags, setFlags] = useState(starterFlags);
  const [history, setHistory] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const contentRef = useRef(null);

  const currentScene = scenes[currentId];
  const homeHeroSrc = useSceneImage(currentId === 'home' ? assetLoaders.homeHero : null);
  const meetSrc = useSceneImage(currentId === 'S10' ? assetLoaders.meet : null);
  const tavernSrc = useSceneImage(currentId === 'T0' ? assetLoaders.tavern : null);
  const tavern2Src = useSceneImage(currentId === 'T7' ? assetLoaders.tavern2 : null);


  const playerLabel = useMemo(() => {
    if (flags.player1) return 'Айдай';
    if (flags.player2) return 'Элина';
    return 'Гость';
  }, [flags]);

  const isPlayerTwo = flags.player2;
  const selectedHeroLoader = useMemo(() => {
    if (flags.player1) return assetLoaders.aidai;
    if (flags.player2) return assetLoaders.elina;
    return null;
  }, [flags.player1, flags.player2]);
  const selectedHeroSrc = useSceneImage(selectedHeroLoader);
  const selectedHero = useMemo(() => {
    if (flags.player1) {
      return { id: 'aidai', label: 'Айдай' };
    }
    if (flags.player2) {
      return { id: 'elina', label: 'Элина' };
    }
    return null;
  }, [flags.player1, flags.player2]);

  const handleOption = (option) => {
    if (!option) return;
    if (currentId === 'intro' && (option.id === 'aidai' || option.id === 'elina')) {
      setFlags((prev) => ({
        ...prev,
        player1: option.id === 'aidai',
        player2: option.id === 'elina',
      }));
      return;
    }
    const next = option.next ?? currentId;
    setHistory((prev) => [...prev, currentId]);
    setCurrentId(next);
    if (option.setFlags?.length) {
      setFlags((prev) => {
        const updated = { ...prev };
        option.setFlags.forEach((flag) => {
          updated[flag] = true;
        });
        return updated;
      });
    }
  };

  const canInteract = !isPlayerTwo;

  useEffect(() => {
    setIsFirstLoad(false);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentId]);

  useEffect(() => {
    const nextSceneIds = currentScene?.options?.map((option) => option.next).filter(Boolean);
    if (!nextSceneIds || nextSceneIds.length === 0) return undefined;
    const loaders = nextSceneIds.flatMap((sceneId) => sceneAssets[sceneId] ?? []);
    const uniqueLoaders = [...new Set(loaders)];
    if (uniqueLoaders.length === 0) return undefined;
    return runIdle(() => {
      uniqueLoaders.forEach((loader) => {
        preloadImage(loader);
      });
    });
  }, [currentId, currentScene]);

  const fadeClass = isFirstLoad ? 'App-fade App-fade--slow' : 'App-fade';

  return (
    <div className="App">
      {currentScene.hero ? (
        <main className={`App-home ${fadeClass}`} key={currentId}>
          <div className="App-home-title">
            <p className="App-overline">Сюжетная игра</p>
            <h1 className="App-title">{currentScene.title}</h1>
            <p className="App-home-text">{currentScene.text}</p>
          </div>
          <div className="App-hero-card">
            {homeHeroSrc ? (
              <img
                className="App-hero-image"
                src={homeHeroSrc}
                alt="Северный путь — героиня на северном ветру"
              />
            ) : (
              <div className="App-skeleton App-hero-image" style={{ aspectRatio: '4 / 3' }} />
            )}
          </div>
          <button
            className="App-button App-button--primary App-home-button"
            type="button"
            onClick={() => handleOption(currentScene.options[0])}
          >
            {currentScene.options[0].label}
          </button>
        </main>
      ) : (
        <>
          <header className="App-header">
            <div>
              <p className="App-overline">Северный путь</p>
              <h1 className="App-title">{currentScene.title}</h1>
            </div>
            <div className="App-meta">
              <span>{playerLabel}</span>
              <span>Сцена: {currentScene.id}</span>
            </div>
          </header>
<AppContent
  currentId={currentId}
  currentScene={currentScene}
  canInteract={canInteract}
  handleOption={handleOption}
  selectedHero={selectedHero}
  selectedHeroSrc={selectedHeroSrc}
  homeHeroSrc={homeHeroSrc}
  meetSrc={meetSrc}
  tavernSrc={tavernSrc}
  tavern2Src={tavern2Src}
  fadeClass={fadeClass}
  contentRef={contentRef}
/>
          <footer className="App-footer">
            <button
              className="App-link"
              type="button"
              onClick={() => setCurrentId(history[history.length - 1] || 'home')}
              disabled={history.length === 0}
            >
              Назад
            </button>
            <button
              className="App-link"
              type="button"
              onClick={() => {
                setCurrentId('home');
                setFlags(starterFlags);
                setHistory([]);
              }}
            >
              Начать заново
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
