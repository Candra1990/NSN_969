import { useEffect, useState } from 'react';
import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

export function useVideoClient({
  apiKey,
  user,
  tokenOrProvider,
}: {
  apiKey: string;
  user: User;
  tokenOrProvider: string;
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

  useEffect(() => {
    const client = new StreamVideoClient({
      apiKey,
      user: user as any,
      token: tokenOrProvider,
    });

    setVideoClient(client);

    return () => {
      try {
        client.disconnectUser().catch((err) => {
          console.warn('Handled error disconnecting video client user:', err);
        });
      } catch (e) {
        console.warn('Error calling video client disconnectUser:', e);
      }
    };
  }, [apiKey, user.id, tokenOrProvider]);

  return videoClient;
}
