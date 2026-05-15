export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`bubble-row bubble-row--${message.role}`}>
      <div className="bubble-avatar" aria-hidden="true">
        {isUser ? '🧒' : '🌟'}
      </div>
      <div className={`bubble bubble--${message.role}`}>
        {message.content}
      </div>
    </div>
  );
}
