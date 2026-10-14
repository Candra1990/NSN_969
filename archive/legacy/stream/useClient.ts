import { useEffect, useState } from 'react';
import { StreamChat, User } from 'stream-chat';

export function useClient({
  apiKey,
  user,
  tokenOrProvider,
}: {
  apiKey: string;
  user: User;
  tokenOrProvider: string;
}) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = new StreamChat(apiKey);
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        await client.connectUser(user, tokenOrProvider);
        if (isMounted) {
          setChatClient(client);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Handled Stream Chat connection restriction:', (err as any)?.message || err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      try {
        client.disconnectUser().catch((err) => {
          console.warn('Handled error disconnecting user:', err);
        });
      } catch (e) {
        console.warn('Error calling disconnectUser:', e);
      }
    };
  }, [apiKey, user.id, tokenOrProvider]);

  return { client: chatClient, error, loading };
}
