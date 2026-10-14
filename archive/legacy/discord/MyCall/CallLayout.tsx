import { useDiscordContext } from '@/contexts/DiscordContext';
import { CallingState } from '@stream-io/video-client';
import {
  useCallStateHooks,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export default function CallLayout() {
  const { setCall } = useDiscordContext();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#070708] h-full w-full text-zinc-400 font-medium space-y-2">
        <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0f1011] border-l border-[#1f2023] flex flex-col h-full overflow-hidden text-zinc-200">
      <StreamTheme>
        <div className="px-6 py-4 border-b border-[#1f2023] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-extrabold uppercase tracking-wide text-zinc-150">Voice Room</span>
          </div>
          <div className="text-xs font-mono font-bold text-zinc-500">
            Participants: {participantCount}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center min-h-0">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        <div className="p-4 bg-[#0a0a0b] border-t border-[#1f2023] flex items-center justify-center shrink-0">
          <CallControls
            onLeave={() => {
              setCall(undefined);
            }}
          />
        </div>
      </StreamTheme>
    </div>
  );
}
