export default function AgentMascot({ state }) {
  return (
    <div className={`mascot-wrapper mascot--${state}`} aria-label={`Sparky is ${state}`}>
      <div className="mascot-body">

        {/* Glow ring behind body */}
        <div className="mascot-glow" />

        {/* Antennas */}
        <div className="mascot-antennas">
          <div className="antenna antenna-left">
            <div className="antenna-ball" />
          </div>
          <div className="antenna antenna-right">
            <div className="antenna-ball" />
          </div>
        </div>

        {/* Main face circle */}
        <div className="mascot-face">
          {/* Cheeks */}
          <div className="mascot-cheeks">
            <div className="cheek cheek-left" />
            <div className="cheek cheek-right" />
          </div>

          {/* Eyes */}
          <div className="mascot-eyes">
            <div className="eye">
              <div className="eye-white">
                <div className="pupil">
                  <div className="pupil-shine" />
                </div>
                {state === 'listening' && <div className="eye-sparkle">✦</div>}
              </div>
            </div>
            <div className="eye">
              <div className="eye-white">
                <div className="pupil">
                  <div className="pupil-shine" />
                </div>
                {state === 'listening' && <div className="eye-sparkle">✦</div>}
              </div>
            </div>
          </div>

          {/* Mouth — shape changes with state */}
          {state === 'idle' && <div className="mouth mouth-smile" />}
          {state === 'listening' && <div className="mouth mouth-open" />}
          {state === 'thinking' && (
            <div className="mouth-thinking">
              <span className="tdot" /><span className="tdot" /><span className="tdot" />
            </div>
          )}
          {state === 'speaking' && <div className="mouth mouth-talking" />}
        </div>
      </div>

      {/* Listening rings */}
      {state === 'listening' && (
        <div className="listen-rings" aria-hidden="true">
          <div className="lring lring-1" />
          <div className="lring lring-2" />
          <div className="lring lring-3" />
        </div>
      )}

      {/* Sound wave bars */}
      {state === 'speaking' && (
        <div className="sound-bars" aria-hidden="true">
          <div className="sbar" />
          <div className="sbar" />
          <div className="sbar" />
          <div className="sbar" />
          <div className="sbar" />
        </div>
      )}

      {/* Thinking orbit */}
      {state === 'thinking' && (
        <div className="think-orbit" aria-hidden="true">
          <div className="orbit-star">⭐</div>
        </div>
      )}
    </div>
  );
}
