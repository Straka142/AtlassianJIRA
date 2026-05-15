const STATE_CONFIG = {
  idle:      { icon: '🎤', label: 'Tap to Talk!',  cls: 'idle' },
  listening: { icon: '🔴', label: 'Listening…',    cls: 'listening' },
  thinking:  { icon: '⏳', label: 'Thinking…',     cls: 'thinking' },
  speaking:  { icon: '🔊', label: 'Speaking…',     cls: 'speaking' },
};

export default function VoiceButton({ state, onStart, onStop }) {
  const { icon, label, cls } = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const isActive = state === 'listening';
  const isDisabled = state === 'thinking' || state === 'speaking';

  const handleClick = () => {
    if (isDisabled) return;
    if (isActive) onStop();
    else onStart();
  };

  return (
    <div className="voice-btn-wrapper">
      <button
        className={`voice-btn voice-btn--${cls}`}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={label}
        aria-pressed={isActive}
      >
        <span className="voice-btn-icon">{icon}</span>
      </button>
      <span className="voice-btn-label">{label}</span>
    </div>
  );
}
