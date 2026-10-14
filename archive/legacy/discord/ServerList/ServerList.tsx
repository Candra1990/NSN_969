import { useChatContext } from 'stream-chat-react';
import { useCallback, useEffect, useState } from 'react';
import { useDiscordContext, DiscordServer } from '@/contexts/DiscordContext';
import CreateServerForm from './CreateServerForm';
import { Link } from '@/hooks/useSpaRouter';
import { Channel } from 'stream-chat';

const ServerList = () => {
  const { client } = useChatContext();
  const { server: activeServer, changeServer } = useDiscordContext();
  const [serverList, setServerList] = useState<DiscordServer[]>([]);

  const loadServerList = useCallback(async (): Promise<void> => {
    try {
      const channels = await client.queryChannels({
        type: 'messaging',
        members: { $in: [client.userID as string] },
      });
      const serverSet: Set<string> = new Set();
      const serverArray: DiscordServer[] = [];

      channels.forEach((channel: Channel) => {
        const cData = channel.data as any;
        const sName = (cData?.server as string) || (cData?.data?.server as string);
        const sImage = (cData?.image as string) || (cData?.data?.image as string);
        if (sName && sName !== 'Unknown' && !serverSet.has(sName)) {
          serverSet.add(sName);
          serverArray.push({
            name: sName,
            image: sImage,
          });
        }
      });

      setServerList(serverArray);
      if (serverArray.length > 0 && !activeServer) {
        changeServer(serverArray[0], client);
      }
    } catch (err) {
      console.error('Error loading server list:', err);
    }
  }, [client, changeServer, activeServer]);

  useEffect(() => {
    loadServerList();
  }, [loadServerList]);

  return (
    <div className="bg-[#1e1f22] h-full flex flex-col items-center w-[72px] py-3 shrink-0 space-y-2 border-r border-[#1f2023]">
      <button
        className={`block p-3 aspect-square border-b border-b-[#2b2d31] transition-all hover:bg-indigo-500 hover:rounded-2xl cursor-pointer ${
          activeServer === undefined ? 'bg-indigo-500 rounded-2xl' : 'bg-[#313338] rounded-[24px]'
        }`}
        onClick={() => changeServer(undefined, client)}
        title="Home Feed"
      >
        <div className="w-8 h-8 flex items-center justify-center text-white">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.35,2.58-2.07a75.48,75.48,0,0,0,72.9,0c.82.72,1.68,1.42,2.58,2.07a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,49.67,123.72,26.83,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
          </svg>
        </div>
      </button>

      <div className="flex flex-col space-y-2 overflow-y-auto max-h-[70vh] w-full items-center">
        {serverList.map((server) => {
          const isSelected = activeServer?.name === server.name;
          return (
            <button
              key={server.name}
              className={`relative group flex items-center justify-center w-12 h-12 transition-all duration-250 cursor-pointer ${
                isSelected ? 'bg-indigo-500 rounded-2xl text-white' : 'bg-[#313338] hover:bg-[#5865f2] rounded-[24px] hover:rounded-2xl text-zinc-200 hover:text-white'
              }`}
              onClick={() => {
                changeServer(server, client);
              }}
              title={server.name}
            >
              {/* Left visual pill indicator */}
              <div className={`absolute -left-3.5 w-2 bg-white rounded-r-full transition-all duration-200 ${
                isSelected ? 'h-10' : 'h-0 group-hover:h-5'
              }`} />

              {server.image && checkIfUrl(server.image) ? (
                <img
                  className="w-12 h-12 rounded-inherit object-cover"
                  src={server.image}
                  alt={server.name}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-sm font-bold uppercase">
                  {server.name.charAt(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Link
        href="/?createServer=true"
        className="flex items-center justify-center rounded-[24px] hover:rounded-2xl bg-[#313338] text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200 p-2 my-2 h-12 w-12 text-2xl font-light cursor-pointer"
        title="Add Server"
      >
        <span className="inline-block">+</span>
      </Link>
      <CreateServerForm />
    </div>
  );

  function checkIfUrl(path: string): boolean {
    try {
      new URL(path);
      return true;
    } catch (_) {
      return false;
    }
  }
};

export default ServerList;
