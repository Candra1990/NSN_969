import {
  Call,
  StreamCall,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';
import { useCallback, useEffect, useState } from 'react';
import CallLayout from './CallLayout';

export default function MyCall({ callId }: { callId: string }) {
  const [call, setCall] = useState<Call | undefined>(undefined);
  const client = useStreamVideoClient();

  const [joining, setJoining] = useState(false);

  const createCall = useCallback(async () => {
    if (!client) return;
    try {
      const callToCreate = client.call('default', callId);
      await callToCreate.camera.disable();
      await callToCreate.join({ create: true });
      setCall(callToCreate);
      setJoining(false);
    } catch (err) {
      console.error('Error creating/joining voice call:', err);
      setJoining(false);
    }
  }, [client, callId]);

  useEffect(() => {
    if (!client) {
      console.error('No client in MyCall component');
      return;
    }

    if (!call) {
      if (joining) {
        createCall();
      } else {
        setJoining(true);
      }
    }
  }, [call, client, createCall, joining]);

  if (!call) {
    return (
      <div className="w-full h-full text-zinc-400 text-sm font-semibold flex flex-col items-center justify-center space-y-3 animate-pulse bg-[#070708]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div>Joining voice call ...</div>
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <CallLayout />
    </StreamCall>
  );
}
