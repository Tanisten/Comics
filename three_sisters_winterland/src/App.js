import { useEffect, useMemo, useRef, useState } from 'react';
import AppContent from './Components/AppContent.jsx';
import './App.css';
import prologue from './chapters/prologue.js';
import chapter1 from './chapters/chapter_1.js';

const START_SCENE_ID = 'P1';

// --- SCENES ---
const scenes = {
  home: {
    id: 'home',
    title: 'Северный путь',
    text: 'История Айдай в суровом северном мире.',
    hero: true,
    options: [{ id: 'start', label: 'Играть', next: 'intro' }],
  },
  intro: {
    id: 'intro',
    title: 'Начало пути',
    text: 'История Айдай начинается.',
    options: [{ id: 'start', label: 'Начать путь', next: START_SCENE_ID }],
  },
  ...prologue,
  ...chapter1,
};

// --- ASSETS ---
const assetLoaders = {
  homeHero: () => import('./assets/northern-path-hero.gif'),
  aidai: () => import('./assets/aidai.png'),
  meet: () => import('./assets/meet.png'),
  tavern: () => import('./assets/tavern.png'),
  tavern2: () => import('./assets/tavern2.png'),
  artisan: () => import('./assets/artisan.png'),
};

const sceneAssets = {
  home: [assetLoaders.homeHero],
  intro: [assetLoaders.aidai],
  S10: [assetLoaders.meet],
  T0: [assetLoaders.tavern],
  T7: [assetLoaders.tavern2],
  T3: [assetLoaders.artisan],
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
  arrowheads_found: false,
  noticed_dry_wood: false,
  followed_tracks: false,
};

function App() {
  const [decisions, setDecisions] = useState({});
  const [gameFlags, setGameFlags] = useState(starterGameFlags);
  const [currentId, setCurrentId] = useState('home');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const contentRef = useRef(null);

  const currentScene = scenes[currentId];

  const decidedOptionId = decisions?.[currentId]?.optionId ?? null;
  const canInteract = !decidedOptionId;

  const currentSceneText = useMemo(() => {
    if (!currentScene) return '';
    if (currentScene.text) return currentScene.text;
    if (currentScene.textByRole) return currentScene.textByRole.p1 ?? '';
    return '';
  }, [currentScene]);

  const homeHeroSrc = useSceneImage(currentId === 'home' ? assetLoaders.homeHero : null);
  const meetSrc = useSceneImage(currentId === 'S10' ? assetLoaders.meet : null);
  const tavernSrc = useSceneImage(currentId === 'T0' ? assetLoaders.tavern : null);
  const tavern2Src = useSceneImage(currentId === 'T7' ? assetLoaders.tavern2 : null);
  const artisanSrc = useSceneImage(currentId === 'T3' ? assetLoaders.artisan : null);

  const handleOption = (option) => {
    if (!option) return;
    if (!canInteract) return;

    const decisionMeta = { optionId: option.id, at: Date.now() };

    setDecisions((prev) => ({ ...prev, [currentId]: decisionMeta }));

    if (option.setFlags?.length) {
      setGameFlags((prev) => {
        const updated = { ...prev };
        option.setFlags.forEach((flag) => (updated[flag] = true));
        return updated;
      });
    }

    const next = option.next ?? currentId;
    setCurrentId(next);
  };

  useEffect(() => setIsFirstLoad(false), []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [currentId]);

  useEffect(() => {
    const nextSceneIds = currentScene?.options?.map((o) => o.next).filter(Boolean);
    if (!nextSceneIds?.length) return;

    const loaders = nextSceneIds.flatMap((sceneId) => sceneAssets[sceneId] ?? []);
    const uniqueLoaders = [...new Set(loaders)];
    if (!uniqueLoaders.length) return;

    return runIdle(() => {
      uniqueLoaders.forEach((loader) => preloadImage(loader));
    });
  }, [currentId, currentScene]);

  const fadeClass = isFirstLoad ? 'App-fade App-fade--slow' : 'App-fade';

  return (
    <div className="App">
      {currentScene?.hero ? (
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
              <h1 className="App-title">{currentScene?.title}</h1>
            </div>
            <div className="App-meta">
              <span>Айдай</span>
              <span>Сцена: {currentScene?.id}</span>
            </div>
          </header>

          <AppContent
            currentId={currentId}
            currentScene={currentScene}
            currentSceneText={currentSceneText}
            canInteract={canInteract}
            handleOption={handleOption}
            meetSrc={meetSrc}
            tavernSrc={tavernSrc}
            tavern2Src={tavern2Src}
            fadeClass={fadeClass}
            contentRef={contentRef}
            artisanSrc={artisanSrc}
            decisions={decisions}
            decidedOptionId={decidedOptionId}
          />

          <footer className="App-footer">
            <button
              className="App-link"
              type="button"
              onClick={() => {
                setDecisions({});
                setGameFlags(starterGameFlags);
                setCurrentId('home');
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
