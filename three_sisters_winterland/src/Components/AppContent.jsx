import React from 'react';

function AppContent({
  currentId,
  currentScene,
  currentSceneText,
  canInteract,
  handleOption,
  selectedHero,
  selectedHeroSrc,
  homeHeroSrc,
  tavern2Src,
  meetSrc,
  tavernSrc,
  fadeClass,
  contentRef,
  artisanSrc,
  decisions,
  decidedOptionId,
  onAdvance,
}) {
  const isIntro = currentId === 'intro';

  // 🔑 ВАЖНО: блокировка ТОЛЬКО если решение уже есть
  const isLockedByDecision = Boolean(decidedOptionId);

  // 🔑 "Далее" показываем ТОЛЬКО если:
  // - нельзя взаимодействовать
  // - И решение уже принято
  const showAdvance = !isIntro && !canInteract && isLockedByDecision;

  // запрещённые опции: "передумать"
  const isForbiddenOption = (option) => {
    if (!option) return true;
    const id = String(option.id ?? '');
    const label = String(option.label ?? '').toLowerCase();
    return id.includes('back_choice') || label.includes('передум');
  };

  return (
    <main className={`App-content ${fadeClass}`} key={currentId} ref={contentRef}>
      {currentId === 'S10' && (
        <div className="App-hero-card App-hero-card--meet">
          {meetSrc ? (
            <img className="App-hero-image App-hero-image--meet" src={meetSrc} alt="Встреча" />
          ) : (
            <div className="App-skeleton App-hero-image App-hero-image--meet" />
          )}
        </div>
      )}

      {currentId === 'T0' && (
        <div className="App-hero-card">
          {tavernSrc ? (
            <img className="App-hero-image" src={tavernSrc} alt="Tavern" />
          ) : (
            <div className="App-skeleton App-hero-image" style={{ aspectRatio: '4 / 3' }} />
          )}
        </div>
      )}

      {currentId === 'T7' && (
        <div className="App-hero-card">
          {tavern2Src ? (
            <img className="App-hero-image" src={tavern2Src} alt="Tavern" />
          ) : (
            <div className="App-skeleton App-hero-image" style={{ aspectRatio: '4 / 3' }} />
          )}
        </div>
      )}

      {currentId === 'T3' && (
        <div className="App-hero-card">
          {artisanSrc ? (
            <img className="App-hero-image" src={artisanSrc} alt="Artisan" />
          ) : (
            <div className="App-skeleton App-hero-image" style={{ aspectRatio: '4 / 3' }} />
          )}
        </div>
      )}

      <div className={`App-text-shell${currentId === 'S10' ? ' App-text-shell--meet' : ''}`}>
        <div className="App-text-scroll">
          <p className="App-text-content">{currentSceneText}</p>
        </div>
      </div>

      <div className="App-options">
        {currentScene?.options?.map((option) => {
          const forbidden = isForbiddenOption(option);

          // 🔑 блокируем ТОЛЬКО если уже принято решение
          const locked = !isIntro && isLockedByDecision;

          const shouldDisable = forbidden || (locked && option.id !== decidedOptionId);

          return (
            <button
              className="App-button"
              type="button"
              key={option.id}
              onClick={() => handleOption(option)}
              disabled={shouldDisable}
              aria-current={option.id === decidedOptionId ? 'true' : 'false'}
            >
              {option.label}
            </button>
          );
        })}

        {showAdvance && (
          <button className="App-button App-button--primary" type="button" onClick={onAdvance}>
            Далее
          </button>
        )}
      </div>

      {currentId === 'intro' && selectedHero && (
        <div className="App-hero-choice App-fade" key={selectedHero.id}>
          {selectedHeroSrc ? (
            <img
              className="App-hero-choice-image"
              src={selectedHeroSrc}
              alt={`Героиня ${selectedHero.label}`}
            />
          ) : (
            <div className="App-skeleton App-hero-choice-image" />
          )}
          <button
            className="App-button App-button--primary App-hero-choice-button"
            type="button"
            onClick={() => handleOption({ id: 'start', next: 'P1' })}
          >
            Играть
          </button>
        </div>
      )}
    </main>
  );
}

export default AppContent;
