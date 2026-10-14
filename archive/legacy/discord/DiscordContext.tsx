import React, { createContext, useContext, useState, useCallback } from 'react';
import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

export interface DiscordServer {
  name: string;
  image?: string;
}

interface DiscordContextType {
  server: DiscordServer | undefined;
  changeServer: (server: DiscordServer | undefined, client?: StreamChat) => void;
  createServer: (
    client: StreamChat,
    videoClient: StreamVideoClient,
    serverName: string,
    serverImage: string,
    userIds: string[]
  ) => Promise<void>;
  callId: string | undefined;
  setCall: (callId: string | undefined) => void;
}

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [server, setServer] = useState<DiscordServer | undefined>(undefined);
  const [callId, setCallId] = useState<string | undefined>(undefined);

  const changeServer = useCallback((newServer: DiscordServer | undefined) => {
    setServer(newServer);
  }, []);

  const createServer = useCallback(
    async (
      client: StreamChat,
      videoClient: StreamVideoClient,
      serverName: string,
      serverImage: string,
      userIds: string[]
    ) => {
      try {
        const channelId = serverName.toLowerCase().replace(/[^a-z0-9_-]/g, '_') + '_general';
        const channel = client.channel('messaging', channelId, {
          name: 'general',
          server: serverName,
          image: serverImage,
          members: userIds,
        } as any);
        await channel.create();

        // Register default call in video sdk
        try {
          const call = videoClient.call('default', channelId);
          await call.getOrCreate();
        } catch (callErr) {
          console.error('Error auto-creating default server call:', callErr);
        }

        setServer({ name: serverName, image: serverImage });
      } catch (err) {
        console.error('Error creating server channel:', err);
      }
    },
    []
  );

  const setCall = useCallback((id: string | undefined) => {
    setCallId(id);
  }, []);

  return (
    <DiscordContext.Provider value={{ server, changeServer, createServer, callId, setCall }}>
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscordContext() {
  const context = useContext(DiscordContext);
  if (context === undefined) {
    throw new Error('useDiscordContext must be used within a DiscordProvider');
  }
  return context;
}
