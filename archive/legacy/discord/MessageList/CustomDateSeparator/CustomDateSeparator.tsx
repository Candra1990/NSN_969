import { DateSeparatorProps } from 'stream-chat-react';

export default function CustomDateSeparator(props: DateSeparatorProps) {
  const { date } = props;

  function formatDate(d: Date): string {
    return d.toLocaleDateString('id-ID', { dateStyle: 'long' });
  }

  return (
    <div className="border-b border-[#1f2023] relative flex items-center justify-center my-6 h-px w-full select-none">
      <span className="absolute text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 bg-[#070708] px-3 py-1 border border-[#1f2023] rounded-full">
        {formatDate(date)}
      </span>
    </div>
  );
}
