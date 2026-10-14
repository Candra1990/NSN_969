import { useEffect } from 'react';
import { useClient } from '@/hooks/useClient';
import { User } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import { AlertTriangle } from 'lucide-react';

import CustomChannelList from '@/components/ChannelList/CustomChannelList';
import ServerList from '@/components/ServerList/ServerList';
import MessageInput from '@/components/MessageList/MessageComposer/MessageComposer';
import CustomDateSeparator from '@/components/MessageList/CustomDateSeparator/CustomDateSeparator';
import CustomMessage from '@/components/MessageList/CustomMessage/CustomMessage';
import { customReactionOptions } from '@/components/MessageList/CustomReactions/CustomReactionsSelector';
import { useVideoClient } from '@/hooks/useVideoClient';
import { StreamVideo } from '@stream-io/video-react-sdk';
import { useDiscordContext, DiscordProvider } from '@/contexts/DiscordContext';
import MyCall from '@/components/MyCall/MyCall';
import CustomChannelHeader from '@/components/MessageList/CustomChannelHeader/CustomChannelHeader';

const ChannelListAny = ChannelList as any;
const ChannelAny = Channel as any;

function ChatLayoutContent({
  apiKey,
  user,
  token,
  onFallback,
}: {
  apiKey: string;
  user: User;
  token: string;
  onFallback?: () => void;
}) {
  const { client: chatClient, error: chatError, loading: chatLoading } = useClient({
    apiKey,
    user,
    tokenOrProvider: token,
  });
  const videoClient = useVideoClient({
    apiKey,
    user,
    tokenOrProvider: token,
  });
  const { callId } = useDiscordContext();

  if (chatLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#070708] text-zinc-400 p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
        <div className="font-medium text-white text-sm">Menghubungkan ke Stream Chat...</div>
        <div className="text-xs text-zinc-500 mt-1">Menginisialisasi websocket & server...</div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#070708] text-zinc-400 p-8 text-center max-w-md mx-auto my-auto">
        <div className="text-amber-500 mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Stream Chat Connection Error</h3>
        <p className="text-xs text-zinc-500 mb-4 font-mono bg-zinc-950/80 p-3 rounded-lg border border-zinc-900/60 break-all select-all">
          {chatError?.message || JSON.stringify(chatError)}
        </p>
        <p className="text-xs text-zinc-400 mb-6">
          Koneksi WebSocket terblokir oleh pembatasan jaringan sandbox / firewall. Silakan beralih ke Mode Firebase untuk chat stabil.
        </p>
        <button
          onClick={() => {
            if (onFallback) onFallback();
          }}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Beralih ke Firebase Chat (Stabil)</span>
        </button>
      </div>
    );
  }

  if (!chatClient) {
    return <div className="p-8 text-zinc-400">Loading Chat Client...</div>;
  }

  if (!videoClient) {
    return <div className="p-8 text-zinc-400">Loading Video Client...</div>;
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient} theme="str-chat__theme-light">
        <section className="flex h-screen w-screen bg-[#070708] overflow-hidden">
          <ServerList />
          <ChannelListAny List={CustomChannelList} sendChannelsToList={true} />
          {callId && <MyCall callId={callId} />}
          {!callId && (
            <ChannelAny
              Message={CustomMessage}
              Input={MessageInput}
              DateSeparator={CustomDateSeparator}
              reactionOptions={customReactionOptions}
              HeaderComponent={CustomChannelHeader}
            >
              <Window>
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </ChannelAny>
          )}
        </section>
      </Chat>
    </StreamVideo>
  );
}

export default function MyChat({
  apiKey,
  user,
  token,
  onFallback,
}: {
  apiKey: string;
  user: User;
  token: string;
  onFallback?: () => void;
}) {
  return (
    <DiscordProvider>
      <ChatLayoutContent apiKey={apiKey} user={user} token={token} onFallback={onFallback} />
    </DiscordProvider>
  );
}
