import React from 'react';

function AppContent({
  currentId,
  currentScene,
  currentSceneText,
  handleOption,
  selectedHero,
  selectedHeroSrc,
  fadeClass,
  contentRef,
  decidedOptionId,
  currentSceneImageSrc,
}) {
  return (
    <main className={`App-content ${fadeClass}`} key={currentId} ref={contentRef}>
      {currentId !== 'intro' && currentSceneImageSrc && (
        <div className="App-hero-card App-hero-card--scene">
          <img
            className="App-hero-image App-hero-image--scene"
            src={currentSceneImageSrc}
            alt={currentScene?.title ?? 'Scene image'}
          />
        </div>
      )}

      <div className={`App-text-shell${currentId === 'S10' ? ' App-text-shell--meet' : ''}`}>
        <div className="App-text-scroll">
          <p className="App-text-content">{currentSceneText}</p>
        </div>
      </div>

      {currentId === 'intro' && currentSceneImageSrc && (
        <div className="App-hero-card App-hero-card--scene">
          <img
            className="App-hero-image App-hero-image--scene"
            src={currentSceneImageSrc}
            alt={currentScene?.title ?? 'Scene image'}
          />
        </div>
      )}

      <div className="App-options">
        {currentScene?.options?.map((option) => (
          <button
            className="App-button"
            type="button"
            key={option.id}
            onClick={() => handleOption(option)}
            aria-current={option.id === decidedOptionId ? 'true' : 'false'}
          >
            {option.label}
          </button>
        ))}
      </div>

      {currentId === 'intro' && selectedHero && (
        <div className="App-hero-choice App-fade" key={selectedHero.id}>
          {selectedHeroSrc ? (
            <img
              className="App-hero-choice-image"
              src={selectedHeroSrc}
              alt={`?????????????? ${selectedHero.label}`}
            />
          ) : (
            <div className="App-skeleton App-hero-choice-image" />
          )}
          <button
            className="App-button App-button--primary App-hero-choice-button"
            type="button"
            onClick={() => handleOption({ id: 'start', next: 'P1' })}
          >
            ????????????
          </button>
        </div>
      )}
    </main>
  );
}

export default AppContent;
