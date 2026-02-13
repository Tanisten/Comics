import { useEffect, useMemo, useRef, useState } from 'react';
import AppContent from './Components/AppContent.jsx';
import './App.css';
import prologue from './chapters/prologue.js';
import chapter1, { chapter1ImageLoaders } from './chapters/chapter_1.js';
import themeMusic from './music/music.mp3';

const SECOND_TRACK_SRC = '/music/after-intro.mp3';
const SECOND_TRACK_DELAY_MS = 8000;

const START_SCENE_ID = 'P1';

// --- SCENES ---
const scenes = {
  home: {
    id: 'home',
    title: 'Северный Путь',
    text: 'Истории в Северном Королевстве.',
    hero: true,
    options: [{ id: 'start', label: 'Играть', next: 'intro' }],
  },
  intro: {
    id: 'intro',
    title: 'Введение',
    text: 'Захватывающие путешествия по загадочным поселениям вдалеке на севере от эльфийских лесов. Выбирай свой путь и влиять на ход событий!',
    options: [{ id: 'start', label: 'Начать путь', next: START_SCENE_ID }],
  },
  ...prologue,
  ...chapter1,
};

// --- ASSETS ---
const assetLoaders = {
  homeHero: () => import('./assets/northern-path-hero.gif'),
  aidai: () => import('./assets/aidai.png'),
};

const sceneImageLoaders = chapter1ImageLoaders;

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
        if (!src) return resolve(null);
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
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
};

const useSceneImage = (loaderOrNull) => {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!loaderOrNull) {
      setSrc(null);
      return;
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

// --- GAME FLAGS ---
const starterGameFlags = {
  talked_to_blacksmith: false,
  talked_to_guard: false,
  talked_to_barkeep: false,
  talked_to_bandits: false,
  ordered_drink: false,
  asked_about_roads: false,
  overpaid_barkeep: false,
  path1_active: false,
  path2_active: false,
  path3_active: false,
  path4_active: false,
  path6_active: false,
  coward_seen: false,
  cart_seen: false,
  arrows_found: false,
  noticed_dry_wood: false,
  followed_tracks: false,
  route_anna_selected: false,
  route_danger_selected: false,
  p2_ostmark_done: false,
  p2_windholm_done: false,
  p2_garrison_done: false,
  p2_fox_done: false,
};

function App() {
  const [decisions, setDecisions] = useState({});
  const [gameFlags, setGameFlags] = useState(starterGameFlags);
  const [currentId, setCurrentId] = useState('home');
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const contentRef = useRef(null);
  const audioRef = useRef(null);
  const musicSwitchTimeoutRef = useRef(null);

  const currentScene = scenes[currentId];
  const currentSceneOptions = useMemo(() => {
    if (!currentScene) return [];
    const options = currentScene.options;
    if (typeof options === 'function') return options({ flags: gameFlags }) ?? [];
    return options ?? [];
  }, [currentScene, gameFlags]);

  const decidedOptionId = decisions?.[currentId]?.optionId ?? null;

  const currentSceneText = useMemo(() => {
    if (!currentScene) return '';
    if (currentScene.text) return currentScene.text;
    if (currentScene.textByRole) return currentScene.textByRole.p1 ?? '';
    return '';
  }, [currentScene]);

  const homeHeroSrc = useSceneImage(currentId === 'home' ? assetLoaders.homeHero : null);
  const aidaiSrc = useSceneImage(currentId === 'intro' ? assetLoaders.aidai : null);
  const sceneImageKey = currentScene?.image ?? null;
  const currentSceneImageSrc = useSceneImage(sceneImageKey ? sceneImageLoaders[sceneImageKey] : null);
  const jumpSceneOptions = useMemo(
    () =>
      Object.values(scenes)
        .filter((scene) => scene?.id && scene.id !== 'home')
        .map((scene) => ({ id: scene.id, title: scene.title ?? scene.id })),
    []
  );

  const handleOption = (option) => {
    if (!option) return;

    const decisionMeta = { optionId: option.id, at: Date.now() };

    setDecisions((prev) => ({ ...prev, [currentId]: decisionMeta }));

    let nextFlags = gameFlags;
    if (option.setFlags?.length) {
      nextFlags = { ...gameFlags };
      option.setFlags.forEach((flag) => (nextFlags[flag] = true));
      setGameFlags(nextFlags);
    }

    const next =
      typeof option.next === 'function' ? option.next({ flags: nextFlags }) : option.next ?? currentId;
    setCurrentId(next);
  };

  useEffect(() => setIsFirstLoad(false), []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setIsJumpMenuOpen(false);
  }, [currentId]);

  useEffect(() => {
    const nextSceneIds = currentSceneOptions
      .map((o) => (typeof o.next === 'string' ? o.next : null))
      .filter(Boolean);
    if (!nextSceneIds?.length) return;

    const loaders = nextSceneIds
      .map((sceneId) => scenes[sceneId]?.image)
      .filter(Boolean)
      .map((key) => sceneImageLoaders[key])
      .filter(Boolean);
    if (!loaders.length) return;
    const uniqueLoaders = [...new Set(loaders)];

    return runIdle(() => {
      uniqueLoaders.forEach((loader) => preloadImage(loader));
    });
  }, [currentId, currentScene, currentSceneOptions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleFirstTrackEnded = () => {
      if (musicSwitchTimeoutRef.current) clearTimeout(musicSwitchTimeoutRef.current);
      musicSwitchTimeoutRef.current = setTimeout(() => {
        const player = audioRef.current;
        if (!player) return;
        player.src = SECOND_TRACK_SRC;
        player.loop = true;
        player.volume = 0.6;
        player.play().catch(() => {});
      }, SECOND_TRACK_DELAY_MS);
    };

    audio.addEventListener('ended', handleFirstTrackEnded);

    return () => {
      audio.removeEventListener('ended', handleFirstTrackEnded);
      if (musicSwitchTimeoutRef.current) clearTimeout(musicSwitchTimeoutRef.current);
    };
  }, []);

  const startExperience = () => {
    setShowSplash(false);
    if (musicSwitchTimeoutRef.current) clearTimeout(musicSwitchTimeoutRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = themeMusic;
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {});
    }
  };

  const jumpToScene = (sceneId) => {
    if (!sceneId || !scenes[sceneId]) return;
    setCurrentId(sceneId);
  };

  const fadeClass = isFirstLoad ? 'App-fade App-fade--slow' : 'App-fade';

  return (
    <div className={`App${showSplash ? ' App--splash' : ''}`}>
      {showSplash ? (
        <button className="App-splash" type="button" onClick={startExperience}>
          <span className="App-splash-title">Северный Путь</span>
          <span className="App-splash-subtitle">Коснись, чтобы начать</span>
        </button>
      ) : currentScene?.hero ? (
        <main className={`App-home ${fadeClass}`} key={currentId}>
          <div className="App-home-title">
            <p className="App-overline">Сюжетная игра</p>
            <h1 className="App-title">{currentScene.title}</h1>
            <p className="App-home-text">{currentScene.text}</p>
          </div>

          <div className="App-hero-card">
            {homeHeroSrc ? (
              <img className="App-hero-image" src={homeHeroSrc} alt="Северный путь" />
            ) : (
              <div className="App-skeleton App-hero-image" />
            )}
          </div>

          <button
            className="App-button App-button--primary App-home-button"
            type="button"
            onClick={() => handleOption(currentSceneOptions[0])}
          >
            {currentSceneOptions[0].label}
          </button>
        </main>
      ) : (
        <>
          <header className="App-header">
            <div>
              <p className="App-overline">Северный путь</p>
              <h1 className="App-title">{currentScene?.title}</h1>
            </div>
            
          </header>

          <AppContent
            currentId={currentId}
            currentScene={currentScene}
            currentSceneText={currentSceneText}
            handleOption={handleOption}
            fadeClass={fadeClass}
            contentRef={contentRef}
            decidedOptionId={decidedOptionId}
            currentSceneImageSrc={currentId === 'intro' ? aidaiSrc : currentSceneImageSrc}
            currentSceneOptions={currentSceneOptions}
          />

          <footer className="App-footer">
            <button
              className="App-link"
              type="button"
              onClick={() => {
                setDecisions({});
                setGameFlags(starterGameFlags);
                setCurrentId('home');
                setIsJumpMenuOpen(false);
              }}
            >
              Начать заново
            </button>
            <div className="App-jump">
              <button
                className="App-burger"
                type="button"
                aria-label="Быстрый переход к сцене"
                aria-expanded={isJumpMenuOpen}
                onClick={() => setIsJumpMenuOpen((prev) => !prev)}
              >
                ☰
              </button>
              {isJumpMenuOpen && (
                <div className="App-jump-menu" role="menu" aria-label="Список сцен">
                  <p className="App-jump-title">Быстрый переход</p>
                  <div className="App-jump-list">
                    {jumpSceneOptions.map((scene) => (
                      <button
                        key={scene.id}
                        className={`App-jump-item${currentId === scene.id ? ' is-active' : ''}`}
                        type="button"
                        onClick={() => jumpToScene(scene.id)}
                      >
                        <span className="App-jump-id">{scene.id}</span>
                        <span className="App-jump-name">{scene.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </footer>
        </>
      )}
      <audio ref={audioRef} src={themeMusic} preload="auto" />
    </div>
  );
}

export default App;
