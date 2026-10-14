import {
  ReactionSelector,
  MessageReactions,
  useMessageContext,
} from 'stream-chat-react';
import { useState } from 'react';
import MessageOptions from './MessageOptions';

export default function CustomMessage() {
  const { message } = useMessageContext();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => {
        setShowOptions(false);
        setShowReactions(false);
      }}
      className="flex relative space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-[#1a1b1d]/40 group select-text"
    >
      <img
        className="rounded-xl aspect-square object-cover w-9 h-9 border border-zinc-900 bg-zinc-950 shrink-0"
        src={message.user?.image || 'https://getstream.io/random_png/'}
        alt="User avatar"
        referrerPolicy="no-referrer"
      />
      <div className="flex-1 min-w-0">
        {showOptions && (
          <MessageOptions showEmojiReactions={setShowReactions} />
        )}
        {showReactions && (
          <div className="absolute z-40 bg-[#1e1f22] border border-[#2b2d31] rounded-xl shadow-2xl p-1 -mt-2 animate-fade-in">
            <ReactionSelector />
          </div>
        )}
        <div className="flex items-baseline space-x-2.5 mb-1 select-none">
          <span className="font-bold text-[12.5px] text-zinc-100 hover:underline cursor-pointer">
            {message.user?.name || message.user?.id}
          </span>
          {message.updated_at && (
            <span className="text-[9px] font-mono font-bold text-zinc-555">
              {formatDate(message.updated_at)}
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-zinc-200 font-sans leading-relaxed break-words whitespace-pre-wrap pr-3">
          {message.text}
        </p>
        <div className="mt-1.5 select-none">
          <MessageReactions />
        </div>
      </div>
    </div>
  );

  function formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      try {
        return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } catch (_) {
        return date;
      }
    }
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
