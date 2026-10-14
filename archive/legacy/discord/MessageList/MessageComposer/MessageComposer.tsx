import {
  Emoji,
  GIF,
  PlusCircle,
  Present,
} from '@/components/ChannelList/Icons';
import { useState } from 'react';
import { SendButton, useChatContext } from 'stream-chat-react';
import { plusItems } from './plusItems';
import ChannelListMenuRow from '@/components/ChannelList/TopBar/ChannelListMenuRow';

export default function MessageComposer() {
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const { channel } = useChatContext();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    channel?.sendMessage({ text: message });
    setMessage('');
  };

  return (
    <div className="flex mx-5 my-5 px-4 py-2 bg-[#2b2d31] items-center space-x-3.5 rounded-xl border border-[#1f2023] focus-within:border-zinc-700 transition relative shrink-0 select-none">
      <button
        type="button"
        onClick={() => setPlusMenuOpen((menuOpen) => !menuOpen)}
        className="text-zinc-400 hover:text-white transition duration-150 cursor-pointer shrink-0"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {plusMenuOpen && (
        <div className="absolute left-4 bottom-14 z-50 p-1.5 bg-[#1e1f22] border border-[#2b2d31] rounded-lg shadow-2xl w-44 flex flex-col space-y-0.5 animate-fade-in">
          {plusItems.map((option) => (
            <button
              key={option.name}
              type="button"
              className="w-full text-left cursor-pointer hover:bg-zinc-800 rounded transition"
              onClick={() => setPlusMenuOpen(false)}
            >
              <ChannelListMenuRow {...option} />
            </button>
          ))}
        </div>
      )}

      <input
        className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-100 placeholder-zinc-500 font-sans"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
        placeholder={`Message #${(channel?.data as any)?.name || 'general'}`}
      />

      <div className="flex items-center space-x-3 text-zinc-400 shrink-0">
        <button type="button" className="hover:text-amber-400 transition cursor-pointer">
          <Present className="w-5 h-5" />
        </button>
        <button type="button" className="hover:text-emerald-400 transition cursor-pointer">
          <GIF className="w-5 h-5" />
        </button>
        <button type="button" className="hover:text-yellow-400 transition cursor-pointer">
          <Emoji className="w-5 h-5" />
        </button>
      </div>

      <div className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer shrink-0">
        <SendButton
          sendMessage={handleSend}
        />
      </div>
    </div>
  );
}
