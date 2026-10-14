'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface YouTubeLiveChatMessage {
  id: string;
  snippet: {
    displayMessage: string;
    publishedAt: string;
    type: string;
  };
  authorDetails: {
    displayName: string;
    profileImageUrl: string;
    isVerified: boolean;
    isChatOwner: boolean;
    isChatSponsor: boolean;
    isChatModerator: boolean;
  };
  timeAdded: number; // For clean automatic element dismissal
}

interface ChatOverlayProps {
  chatId: string;
  isChatOpen: boolean;
  onToggleChat?: () => void;
  bubbleSize?: 'small' | 'medium' | 'large';
  bubbleOpacity?: number;
  bubbleBgOpacity?: number;
  externalUrl?: string;
}

export function ChatOverlay({
  chatId,
  isChatOpen,
  onToggleChat,
  bubbleSize = 'medium',
  bubbleOpacity = 1,
  bubbleBgOpacity = 0.6,
  externalUrl,
}: ChatOverlayProps) {
  const [messages, setMessages] = useState<YouTubeLiveChatMessage[]>([]);
  // Ref polling logic
  const tokenRef = useRef<string | null>(null);

  // Size configuration
  const sizeConfig = {
    small: {
      container: 'py-1 px-2.5 max-w-[85%] md:max-w-[50%]',
      avatar: 16,
      avatarClass: 'w-4 h-4',
      name: 'text-[9px] mb-0',
      message: 'text-[10px] leading-tight',
      gap: 'gap-1.5',
    },
    medium: {
      container: 'py-1.5 px-3 max-w-[90%] md:max-w-[80%]',
      avatar: 20,
      avatarClass: 'w-5 h-5',
      name: 'text-[10px] mb-0.5',
      message: 'text-xs leading-tight',
      gap: 'gap-2',
    },
    large: {
      container: 'py-2 px-4 max-w-[95%] md:max-w-[90%]',
      avatar: 28,
      avatarClass: 'w-7 h-7',
      name: 'text-xs mb-0.5',
      message: 'text-sm leading-snug',
      gap: 'gap-3',
    },
  };

  const config = sizeConfig[bubbleSize];

  useEffect(() => {
    if (!isChatOpen) {
      setMessages([]);
      return;
    }

    const cleanChatId = chatId ? chatId.trim() : '';
    if (!cleanChatId || cleanChatId === 'undefined' || cleanChatId === 'null') {
      return;
    }

    let isActive = true;
    const abortController = new AbortController();

    const fetchChat = async () => {
      if (!isActive) return;
      try {
        const params = new URLSearchParams();
        params.set('chatId', cleanChatId);
        if (tokenRef.current) params.set('pageToken', tokenRef.current);

        const res = await fetch(`/api/chat?${params.toString()}`, {
          signal: abortController.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!isActive) return;

        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            return;
          }
          
          const data = await res.json();
          if (!isActive) return;

          if (data?.nextPageToken) {
            tokenRef.current = data.nextPageToken;
          }
          if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
            setMessages((prev) => {
              const now = Date.now();
              const newMsgs = data.items
                .filter((newMsg: YouTubeLiveChatMessage) => !prev.some((oldMsg) => oldMsg.id === newMsg.id))
                .map((newMsg: YouTubeLiveChatMessage) => ({
                  ...newMsg,
                  timeAdded: now,
                }));
              return [...prev, ...newMsgs].slice(-8); // Keep last 8 bubbles
            });
          }
          if (data?.pollingIntervalMillis && typeof data.pollingIntervalMillis === 'number') {
            return Math.max(3000, Math.min(data.pollingIntervalMillis, 15000));
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // Gracefully suppress network/offline errors during live chat polling
        console.debug?.('[ChatOverlay] Background live chat poll suppressed:', err?.message || err);
      }
      return 5000;
    };

    // Initial fetch
    let nextTimeout: NodeJS.Timeout | null = null;

    const scheduleNextPoll = (intervalMs = 5000) => {
      if (!isActive) return;
      nextTimeout = setTimeout(async () => {
        const nextInterval = await fetchChat();
        if (isActive) {
          scheduleNextPoll(nextInterval || 5000);
        }
      }, intervalMs);
    };

    fetchChat().then((recommendedInterval) => {
      if (isActive) {
        scheduleNextPoll(recommendedInterval || 5000);
      }
    });

    return () => {
      isActive = false;
      abortController.abort();
      if (nextTimeout) clearTimeout(nextTimeout);
    };
  }, [chatId, isChatOpen]);

  // Clean elements periodically to trigger Framer Motion's smooth exit animations
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMessages((prev) =>
        prev.filter((msg) => {
          const added = msg.timeAdded || now;
          return now - added < 10000; // Limit bubble persistence to 10 seconds for clean dynamic view
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isChatOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 top-12 flex flex-col justify-end pointer-events-none px-4 pb-4 select-none">
      {/* Scrollable container for bubbles */}
      <div 
        style={{ opacity: bubbleOpacity }} 
        className="flex flex-col items-start space-y-2 overflow-hidden justify-end pb-2 min-h-[140px] max-h-[85%]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95, transition: { duration: 0.25, ease: 'easeOut' } }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                backgroundColor: `rgba(18, 18, 22, ${bubbleBgOpacity})`,
              }}
              className={`backdrop-blur-md rounded-2xl flex items-center shadow-lg border border-white/5 ${config.container} ${config.gap}`}
            >
              <img 
                src={msg.authorDetails.profileImageUrl} 
                alt={msg.authorDetails.displayName} 
                width={config.avatar} 
                height={config.avatar} 
                className={`rounded-full border border-white/10 shrink-0 ${config.avatarClass}`}
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col min-w-0">
                <span className={`font-black text-white/50 leading-none truncate ${config.name}`}>
                  {msg.authorDetails.displayName}
                </span>
                <span className={`text-white font-medium drop-shadow-sm leading-tight text-left break-words ${config.message}`}>
                  {msg.snippet.displayMessage}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control Toggle Button - Redirects to YouTube */}
      <div className="pointer-events-auto mt-1 z-30 flex items-center justify-start">
        <a 
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-zinc-950/80 hover:bg-[#e5a93c] hover:text-black hover:border-[#e5a93c] backdrop-blur-md text-white/70 hover:text-black text-[9.5px] font-black uppercase tracking-wider px-3.5 py-1.8 rounded-full border border-white/10 flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          LIVE CHAT
        </a>
      </div>
    </div>
  );
}
