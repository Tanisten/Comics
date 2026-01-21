import { useMemo, useState } from 'react';
import './App.css';
import heroImage from './assets/northern-path-hero.gif';
import aidaiImage from './assets/aidai.png';
import elinaImage from './assets/elina.png';

const scenes = {
  home: {
    id: 'home',
    title: 'Северный путь',
    text: 'История двух сестёр, которую можно пройти вдвоём.',
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
  T0: {
    id: 'T0',
    title: 'Трактир «Северный огонь» — Вход',
    text:
      'Дверь закрывается за вами тяжёлым звуком. Внутри теплее, но не тепло. Огонь в очаге трещит, будто сердится. Запах эля, мокрых плащей и дыма. Люди говорят тихо — не потому что устали, а потому что не хотят, чтобы их слышали.',
    options: [
      { id: 'T0-1', label: 'Осмотреть зал', next: 'T1' },
      { id: 'T0-2', label: 'Подойти к стойке', next: 'T2' },
      { id: 'T0-3', label: 'Сесть за ближайший стол', next: 'T7' },
      { id: 'T0-4', label: 'Остаться у двери', next: 'T6' },
    ],
  },
  T1: {
    id: 'T1',
    title: 'Осмотр зала',
    text:
      'Зал полон. Люди смеются, поют, играют в кости. Огонь отражается в кружках. Смех — как занавес. Ты замечаешь мужчину у стены, стражника у окна, ремесленника и стол в углу.',
    options: [
      { id: 'T1-1', label: 'Подойти к ремесленнику', next: 'T3', setFlags: ['talked_to_blacksmith'] },
      { id: 'T1-2', label: 'Подойти к стражнику', next: 'T4', setFlags: ['talked_to_guard'] },
      { id: 'T1-3', label: 'Подойти к трактирщику', next: 'T2', setFlags: ['talked_to_barkeep'] },
      { id: 'T1-4', label: 'Подойти к тем, кто в углу', next: 'T5', setFlags: ['talked_to_bandits'] },
      { id: 'T1-5', label: 'Вернуться ко входу', next: 'T0' },
    ],
  },
  T2: {
    id: 'T2',
    title: 'Трактирщик',
    text:
      'Трактирщик улыбается привычно. Он вытирает уже чистую кружку. Когда ты подходишь, он смотрит не на тебя, а в сторону. И сразу обратно.',
    options: [
      { id: 'T2-1', label: 'Заказать эль', next: 'T7', setFlags: ['ordered_drink'] },
      { id: 'T2-2', label: 'Спросить, что происходит в городе', next: 'T7', setFlags: ['talked_to_barkeep'] },
      { id: 'T2-3', label: 'Спросить про дороги', next: 'T7', setFlags: ['asked_about_roads'] },
      { id: 'T2-4', label: 'Оставить больше монет, чем нужно', next: 'S0', setFlags: ['overpaid_barkeep', 'path2_active'] },
      { id: 'T2-5', label: 'Вернуться в зал', next: 'T1' },
    ],
  },
  T3: {
    id: 'T3',
    title: 'Ремесленник',
    text:
      'Он говорит о торговцах, политике, страхе. «Вы не понимаете. Они перестали продавать. Это не зима. Это подготовка».',
    options: [
      { id: 'T3-1', label: 'Спросить, что он имеет в виду', next: 'T1' },
      { id: 'T3-2', label: 'Спросить про север', next: 'T1' },
      { id: 'T3-3', label: 'Спросить про торговцев', next: 'T1' },
      { id: 'T3-4', label: 'Спросить про зверей', next: 'T1' },
    ],
  },
  T4: {
    id: 'T4',
    title: 'Стражник',
    text:
      'Он смотрит в окно. Говорит о лошадях, вернувшихся без людей. О странных следах.',
    options: [
      { id: 'T4-1', label: 'Спросить про лошадей', next: 'T1' },
      { id: 'T4-2', label: 'Спросить про обозы', next: 'T1' },
      { id: 'T4-3', label: 'Спросить, что он видел', next: 'T1' },
      { id: 'T4-4', label: 'Предложить монеты', next: 'S0' },
    ],
  },
  T5: {
    id: 'T5',
    title: 'Разбойники',
    text: 'Они говорят о путях, которые «не для всех».',
    options: [
      { id: 'T5-1', label: 'Спросить, что он имеет в виду', next: 'S0', setFlags: ['path4_active'] },
      { id: 'T5-2', label: 'Спросить про дороги', next: 'S0', setFlags: ['path4_active'] },
      { id: 'T5-3', label: 'Спросить, могут ли помочь', next: 'S0', setFlags: ['path4_active'] },
      { id: 'T5-4', label: 'Уйти', next: 'T1' },
    ],
  },
  T6: {
    id: 'T6',
    title: 'Трус',
    text:
      'Скрип стула. Взгляд, который скользит мимо. Кто-то уходит слишком быстро, будто боится быть замеченным.',
    options: [{ id: 'T6-1', label: 'Вернуться к залу', next: 'T1', setFlags: ['coward_seen'] }],
  },
  T7: {
    id: 'T7',
    title: 'Центр зала',
    text: 'Музыка громче, смех резче. В этом шуме трудно понять, кто слушает.',
    options: [
      { id: 'T7-1', label: 'Ремесленник', next: 'T3' },
      { id: 'T7-2', label: 'Трактирщик', next: 'T2' },
      { id: 'T7-3', label: 'Стражник', next: 'T4' },
      { id: 'T7-4', label: 'Угол', next: 'T5' },
      { id: 'T7-5', label: 'Выйти', next: 'T8' },
    ],
  },
  T8: {
    id: 'T8',
    title: 'Выход',
    text: 'Свет внутри, снег снаружи. Ветер пахнет хвоей и недосказанностью.',
    options: [
      { id: 'T8-1', label: 'Пойти к повозке', next: 'S0' },
      { id: 'T8-2', label: 'Пойти по улице', next: 'S1' },
      { id: 'T8-3', label: 'Остановиться', next: 'T0' },
    ],
  },
  S0: {
    id: 'S0',
    title: 'Улица',
    text:
      'Снег скрипит под сапогами. Холодный воздух мгновенно забирается под плащ.',
    options: [{ id: 'S0-1', label: 'Пойти к повозке', next: 'C0', setFlags: ['cart_seen'] }],
  },
  S1: {
    id: 'S1',
    title: 'Переход',
    text: 'Дорога тянется вдоль домов, но взгляд всё равно возвращается к повозке.',
    options: [{ id: 'S1-1', label: 'К повозке', next: 'C0', setFlags: ['cart_seen'] }],
  },
  C0: {
    id: 'C0',
    title: 'Повозка',
    text: 'Лошади беспокойны. На снегу видны следы, которые ведут в разные стороны.',
    options: [{ id: 'C0-1', label: 'Осмотреться ближе', next: 'C1' }],
  },
  C1: {
    id: 'C1',
    title: 'Осмотр',
    text:
      'Под досками ты находишь стрелы. Боевые наконечники чистые, почти новые.',
    options: [{ id: 'C1-1', label: 'Подумать, что это значит', next: 'C2', setFlags: ['arrowheads_found'] }],
  },
  C2: {
    id: 'C2',
    title: 'Выбор',
    text:
      'Слишком много путей. Каждый обещает ответ, но каждый требует цены.',
    options: [
      { id: 'C2-1', label: 'Вернуться в трактир', next: 'T3', setFlags: ['path1_active'] },
      { id: 'C2-2', label: 'Пойти к Анне', next: 'A0', setFlags: ['path2_active'] },
      { id: 'C2-3', label: 'Осмотреться и подумать', next: 'E0', setFlags: ['path6_active', 'noticed_dry_wood'] },
      { id: 'C2-4', label: 'Пойти по следам', next: 'E0', setFlags: ['path4_active', 'followed_tracks'] },
      { id: 'C2-5', label: 'Уйти, не решая', next: 'E0', setFlags: ['path3_active'] },
    ],
  },
  A0: {
    id: 'A0',
    title: 'Дом Анны',
    text:
      'Анна — вдова торговца. Она смотрит на тебя долго, прежде чем сказать: «Можно идти через поселения. Это дольше, но безопаснее».',
    options: [{ id: 'A0-1', label: 'Согласиться', next: 'E0' }],
  },
  E0: {
    id: 'E0',
    title: 'Выход к лесу',
    text:
      'Город остаётся позади. Лес принимает вас без вопросов. Теперь путь выбран, и он будет помнить каждый шаг.',
    options: [{ id: 'E0-1', label: 'Продолжить путь', next: 'intro', setFlags: ['game_started'] }],
  },
};

const starterFlags = {
  game_started: false,
  player1: false,
  player2: false,
};

function App() {
  const [currentId, setCurrentId] = useState('home');
  const [flags, setFlags] = useState(starterFlags);
  const [history, setHistory] = useState([]);

  const currentScene = scenes[currentId];

  const playerLabel = useMemo(() => {
    if (flags.player1) return 'Айдай';
    if (flags.player2) return 'Элина';
    return 'Гость';
  }, [flags]);

  const isPlayerTwo = flags.player2;
  const selectedHero = useMemo(() => {
    if (flags.player1) {
      return { id: 'aidai', label: 'Айдай', image: aidaiImage };
    }
    if (flags.player2) {
      return { id: 'elina', label: 'Элина', image: elinaImage };
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

  return (
    <div className="App">
      {currentScene.hero ? (
        <main className="App-home">
          <div className="App-home-title">
            <p className="App-overline">Сюжетная игра</p>
            <h1 className="App-title">{currentScene.title}</h1>
            <p className="App-home-text">{currentScene.text}</p>
          </div>
          <div className="App-hero-card">
            <img className="App-hero-image" src={heroImage} alt="Северный путь — героиня на северном ветру" />
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
          <main className="App-content">
            <p className="App-text">{currentScene.text}</p>
            <div className="App-options">
              {currentScene.options.map((option) => {
                const disabled = !canInteract && currentId !== 'intro';
                return (
                  <button
                    className="App-button"
                    type="button"
                    key={option.id}
                    onClick={() => handleOption(option)}
                    disabled={disabled}
                  >
                    {option.label}
                  </button>
                );
              })}
              {!canInteract && currentId !== 'intro' && (
                <button
                  className="App-button App-button--primary"
                  type="button"
                  onClick={() => handleOption(currentScene.options[0])}
                >
                  Далее
                </button>
              )}
            </div>
            {currentId === 'intro' && selectedHero && (
              <div className="App-hero-choice">
                <img
                  className="App-hero-choice-image"
                  src={selectedHero.image}
                  alt={`Героиня ${selectedHero.label}`}
                />
                <button
                  className="App-button App-button--primary App-hero-choice-button"
                  type="button"
                  onClick={() => handleOption({ id: 'start', next: 'T0' })}
                >
                  Играть
                </button>
              </div>
            )}
          </main>
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
