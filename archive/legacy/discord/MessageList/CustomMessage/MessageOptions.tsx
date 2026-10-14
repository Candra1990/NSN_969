import { ArrowUturnLeft, Emoji, Thread } from '@/components/ChannelList/Icons';
import { Dispatch, SetStateAction } from 'react';

export default function MessageOptions({
  showEmojiReactions,
}: {
  showEmojiReactions: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="absolute flex items-center -top-4 right-2 rounded-lg bg-[#1e1f22] border border-[#2b2d31] shadow-xl divide-x divide-[#2b2d31] overflow-hidden z-30 select-none">
      <button
        type="button"
        className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
        onClick={() => showEmojiReactions((curr) => !curr)}
        title="Reaksi Emoji"
      >
        <Emoji className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
        title="Balas Obrolan"
      >
        <ArrowUturnLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
        title="Buat Thread"
      >
        <Thread className="w-5 h-5" />
      </button>
    </div>
  );
}
