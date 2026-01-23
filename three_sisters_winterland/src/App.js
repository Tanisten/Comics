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

// --- ASSETS ---
const assetLoaders = {
  homeHero: () => import('./assets/northern-path-hero.gif'),
  aidai: () => import('./assets/aidai.png'),
  elina: () => import('./assets/elina.png'),
  meet: () => import('./assets/meet.png'),
  tavern: () => import('./assets/tavern.png'),
  tavern2: () => import('./assets/tavern2.png'),
  artisan: () => import('./assets/artisan.png'),
};

const sceneAssets = {
  home: [assetLoaders.homeHero],
  intro: [assetLoaders.aidai, assetLoaders.elina],
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

// --- GAME FLAGS (общие для игры, НЕ роль) ---
const starterGameFlags = {
  game_started: false,
  prologue_started: false,
  alarm_raised_by_player2: false,
  sisters_united: false,
  north_silence_noted: false,
  war_preparations_reported: false,
  report_sent_to_elven_high_lord: false,
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

// --- STORAGE KEYS ---
const SHARED_KEY = 'np_shared_state_v1'; // decisions + gameFlags
const ROLE_KEY = 'np_role_v1'; // только для этого устройства/вкладки (sessionStorage лучше)

function computeFrontier(decisions) {
  const visited = new Set();
  let id = START_SCENE_ID;

  while (true) {
    if (!id) return START_SCENE_ID;
    if (visited.has(id)) return id; // защита от циклов
    visited.add(id);

    const scene = scenes[id];
    if (!scene || !scene.options || scene.options.length === 0) return id;

    const decidedOptionId = decisions[id];
    if (!decidedOptionId) return id;

    const opted = scene.options.find((o) => o.id === decidedOptionId);
    const nextId = opted?.next;

    if (!nextId || nextId === id) return id;
    id = nextId;
  }
}
const dbg = (...args) => console.log('[NP]', ...args);


function App() {
  // роль НЕ шарим (чтобы 2 игрока могли быть в разных вкладках/телефонах)
  const [role, setRole] = useState(() => {
    try {
      return sessionStorage.getItem(ROLE_KEY) || 'guest'; // 'p1' | 'p2' | 'guest'
    } catch {
      return 'guest';
    }
  });

  // общий прогресс игры (решения + флаги) — шарим
  const [decisions, setDecisions] = useState({});
  const [gameFlags, setGameFlags] = useState(starterGameFlags);

  // локальные вещи (не шарим)
  const [currentId, setCurrentId] = useState('home');
  const [history, setHistory] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const contentRef = useRef(null);

  const tabIdRef = useRef(
  `tab_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
);
const tabId = tabIdRef.current;


// загрузка shared state
useEffect(() => {
  console.log('[NP]', tabId, 'LOAD shared state start');

  try {
    const raw = localStorage.getItem(SHARED_KEY);
    console.log('[NP]', tabId, 'LOAD raw:', raw);

    if (!raw) {
      console.log('[NP]', tabId, 'LOAD end (no data)');
      return;
    }

    const parsed = JSON.parse(raw);
    console.log('[NP]', tabId, 'LOAD parsed decisions keys:', Object.keys(parsed?.decisions ?? {}));
    console.log(
      '[NP]',
      tabId,
      'LOAD parsed truthy flags:',
      Object.entries(parsed?.gameFlags ?? {}).filter(([, v]) => v)
    );

    if (parsed?.decisions && typeof parsed.decisions === 'object') {
      setDecisions(parsed.decisions);
    }
    if (parsed?.gameFlags && typeof parsed.gameFlags === 'object') {
      setGameFlags((prev) => ({ ...prev, ...parsed.gameFlags }));
    }
  } catch (e) {
    console.log('[NP]', tabId, 'LOAD error:', e);
  }

  console.log('[NP]', tabId, 'LOAD shared state end');
}, []);


  // сохранение shared state
 useEffect(() => {
  const decisionsKeys = Object.keys(decisions ?? {});
  const truthyFlags = Object.entries(gameFlags ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k);

  console.log('[NP]', tabId, 'SAVE shared', {
    currentId,
    decisionsKeys,
    truthyFlags,
  });

  try {
    localStorage.setItem(
      SHARED_KEY,
      JSON.stringify({ decisions, gameFlags, v: 1 })
    );
  } catch (e) {
    console.log('[NP]', tabId, 'SAVE error:', e);
  }
}, [decisions, gameFlags, currentId, tabId]);


  // сохранить роль
  useEffect(() => {
    try {
      sessionStorage.setItem(ROLE_KEY, role);
    } catch {
      // ignore
    }
  }, [role]);

  const currentScene = scenes[currentId];

  // frontier (первая нерешённая сцена на общем пути)
  const frontierId = useMemo(() => computeFrontier(decisions), [decisions]);

  // правило взаимодействия:
  // - если сцена уже имеет решение -> НИКТО не может менять (только "Далее")
  // - если решения нет:
  //    - P1 может выбирать
  //    - P2 может выбирать ТОЛЬКО если currentId === frontierId
  const decidedOptionId = decisions[currentId] ?? null;
  const isSceneDecided = Boolean(decidedOptionId);

  const isPlayerOne = role === 'p1';
  const isPlayerTwo = role === 'p2';

  const canChooseHere = useMemo(() => {
    if (currentId === 'intro') return true; // выбор роли всегда доступен
    if (isSceneDecided) return false;
    if (isPlayerOne) return true;
    if (isPlayerTwo) return currentId === frontierId;
    return true; // guest (для теста)
  }, [currentId, frontierId, isPlayerOne, isPlayerTwo, isSceneDecided]);

  // "Далее" должно идти по зафиксированному решению
  const advanceAlongDecisions = () => {
    const scene = scenes[currentId];
    if (!scene?.options?.length) return;

    // если уже решено — идём по выбранной опции
    if (decisions[currentId]) {
      const chosen = scene.options.find((o) => o.id === decisions[currentId]);
      const next = chosen?.next;
      if (next) {
        setHistory((prev) => [...prev, currentId]);
        setCurrentId(next);
      }
      return;
    }

    // если не решено — но кнопка "Далее" вызвана (на всякий случай) — берём 1ю опцию
    const next = scene.options[0]?.next;
    if (next) {
      setHistory((prev) => [...prev, currentId]);
      setCurrentId(next);
    }
  };

  const playerLabel = useMemo(() => {
    if (isPlayerOne) return 'Айдай (P1)';
    if (isPlayerTwo) return 'Элина (P2)';
    return 'Гость';
  }, [isPlayerOne, isPlayerTwo]);

  const selectedHeroLoader = useMemo(() => {
    if (isPlayerOne) return assetLoaders.aidai;
    if (isPlayerTwo) return assetLoaders.elina;
    return null;
  }, [isPlayerOne, isPlayerTwo]);

  const selectedHeroSrc = useSceneImage(selectedHeroLoader);

  const selectedHero = useMemo(() => {
    if (isPlayerOne) return { id: 'aidai', label: 'Айдай' };
    if (isPlayerTwo) return { id: 'elina', label: 'Элина' };
    return null;
  }, [isPlayerOne, isPlayerTwo]);

  // images per scene
  const homeHeroSrc = useSceneImage(currentId === 'home' ? assetLoaders.homeHero : null);
  const meetSrc = useSceneImage(currentId === 'S10' ? assetLoaders.meet : null);
  const tavernSrc = useSceneImage(currentId === 'T0' ? assetLoaders.tavern : null);
  const tavern2Src = useSceneImage(currentId === 'T7' ? assetLoaders.tavern2 : null);
  const artisanSrc = useSceneImage(currentId === 'T3' ? assetLoaders.artisan : null);

  const handleOption = (option) => {
    if (!option) return;

    // выбор роли на intro
    if (currentId === 'intro' && (option.id === 'aidai' || option.id === 'elina')) {
      setRole(option.id === 'aidai' ? 'p1' : 'p2');
      return;
    }

    // старт игры после выбора роли
    if (currentId === 'intro' && option.id === 'start') {
      setHistory((prev) => [...prev, currentId]);
      setCurrentId(option.next ?? START_SCENE_ID);
      setGameFlags((prev) => ({ ...prev, game_started: true }));
      return;
    }

    // если сцена уже решена — не даём менять
    if (decisions[currentId]) return;

    // если нельзя выбирать на этой сцене (P2 до frontier) — тоже стоп
    if (!canChooseHere) return;

    // фиксируем решение
    setDecisions((prev) => ({
      ...prev,
      [currentId]: option.id,
    }));

    // применяем setFlags в общий gameFlags
    if (option.setFlags?.length) {
      setGameFlags((prev) => {
        const updated = { ...prev };
        option.setFlags.forEach((flag) => {
          updated[flag] = true;
        });
        return updated;
      });
    }

    // переход
    const next = option.next ?? currentId;
    setHistory((prev) => [...prev, currentId]);
    setCurrentId(next);
  };

  useEffect(() => setIsFirstLoad(false), []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [currentId]);

  // preload next images
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

  // если P2 зашёл и игра уже началась — можно стартовать с начала пути
  // (это НЕ телепорт на frontier: он всё равно будет жать "Далее" по выборам)
  useEffect(() => {
    if (!isPlayerTwo) return;
    if (!gameFlags.game_started) return;
    if (currentId === 'home' || currentId === 'intro') {
      setCurrentId(START_SCENE_ID);
      setHistory([]);
    }
  }, [isPlayerTwo, gameFlags.game_started, currentId]);

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
              <h1 className="App-title">{currentScene?.title}</h1>
              {gameFlags.game_started && (
  <p className="App-overline" style={{ marginTop: 6 }}>
    Frontier: {frontierId}
  </p>
)}

            </div>
            <div className="App-meta">
              <span>{playerLabel}</span>
              <span>Сцена: {currentScene?.id}</span>
            </div>
          </header>

          <AppContent
            currentId={currentId}
            currentScene={currentScene}
            canInteract={canChooseHere}
            handleOption={handleOption}
            selectedHero={selectedHero}
            selectedHeroSrc={selectedHeroSrc}
            homeHeroSrc={homeHeroSrc}
            meetSrc={meetSrc}
            tavernSrc={tavernSrc}
            tavern2Src={tavern2Src}
            fadeClass={fadeClass}
            contentRef={contentRef}
            artisanSrc={artisanSrc}
            decisions={decisions}
            decidedOptionId={decidedOptionId}
            onAdvance={advanceAlongDecisions}
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
                // сброс shared состояния
                setDecisions({});
                setGameFlags(starterGameFlags);
                try {
                  localStorage.removeItem(SHARED_KEY);
                } catch {
                  // ignore
                }

                // сброс локального
                setCurrentId('home');
                setHistory([]);
                setRole('guest');
                try {
                  sessionStorage.removeItem(ROLE_KEY);
                } catch {
                  // ignore
                }
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
