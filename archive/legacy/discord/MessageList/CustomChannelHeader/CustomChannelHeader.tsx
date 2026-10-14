import { useChannelStateContext } from 'stream-chat-react';

export default function CustomChannelHeader() {
  const { channel } = useChannelStateContext();
  const name = (channel?.data as any)?.name || 'general';
  
  return (
    <div className="flex items-center space-x-3 p-3.5 bg-zinc-950 border-b border-[#1f2023] shrink-0">
      <span className="text-xl font-medium text-indigo-400 select-none">#</span>
      <span className="font-extrabold text-sm uppercase tracking-wider text-zinc-150 font-sans">{name}</span>
    </div>
  );
}
