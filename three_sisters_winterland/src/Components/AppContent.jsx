import React from 'react';  

function AppContent({
  currentId,
  currentScene,
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
}) {
  return (
          <main className={`App-content ${fadeClass}`} key={currentId} ref={contentRef}>
            {currentId === 'S10' && (
              <div className="App-hero-card App-hero-card--meet">
                {meetSrc ? (
                  <img
                    className="App-hero-image App-hero-image--meet"
                    src={meetSrc}
                    alt="Встреча"
                  />
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
            <div className={`App-text-shell${currentId === 'S10' ? ' App-text-shell--meet' : ''}`}>
              <div className="App-text-scroll">
                <p className="App-text-content">{currentScene.text}</p>
              </div>
            </div>
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
