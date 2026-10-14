import { useDiscordContext } from '@/contexts/DiscordContext';
import { UserObject } from '@/model/UserObject';
import { Link, useSearchParams, useRouter } from '@/hooks/useSpaRouter';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatContext } from 'stream-chat-react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { CloseMark } from '../ChannelList/Icons';
import UserRow from '../ChannelList/CreateChannelForm/UserRow';

type FormState = {
  serverName: string;
  serverImage: string;
  users: UserObject[];
};

const CreateServerForm = () => {
  const searchParams = useSearchParams();
  const showCreateServerForm = searchParams.get('createServer');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { createServer } = useDiscordContext();
  const initialState: FormState = {
    serverName: '',
    serverImage: '',
    users: [],
  };

  const [formData, setFormData] = useState<FormState>(initialState);
  const [users, setUsers] = useState<UserObject[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await client.queryUsers({});
      const usersList: UserObject[] = response.users
        .filter((u) => u.role !== 'admin')
        .map((u) => {
          return {
            id: u.id,
            name: (u.name as string) || u.id,
            image: u.image as string,
            online: u.online,
            lastOnline: u.last_active,
          };
        });
      setUsers(usersList);
    } catch (err) {
      console.error('Error loading users inside server creation:', err);
    }
  }, [client]);

  useEffect(() => {
    if (showCreateServerForm && dialogRef.current) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [showCreateServerForm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const userChanged = (user: UserObject, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        users: [...prev.users, user],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== user.id),
      }));
    }
  };

  const buttonDisabled = (): boolean => {
    return (
      !formData.serverName ||
      !formData.serverImage ||
      formData.users.length === 0
    );
  };

  const createClicked = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!videoClient) {
      console.log('[CreateServerForm] Video client not available');
      return;
    }
    await createServer(
      client,
      videoClient,
      formData.serverName,
      formData.serverImage,
      formData.users.map((u) => u.id)
    );
    setFormData(initialState);
    router.replace('/');
  };

  return (
    <dialog
      className="absolute z-55 m-auto bg-[#313338] text-zinc-100 p-0 rounded-xl max-w-lg w-full shadow-2xl border border-[#1f2023] backdrop:bg-black/70 overflow-hidden"
      ref={dialogRef}
    >
      <div className="w-full flex items-center justify-between py-6 px-6 border-b border-[#1f2023]">
        <h2 className="text-xl font-extrabold uppercase tracking-wide text-zinc-100 font-sans">
          Create new server
        </h2>
        <Link href="/" className="hover:scale-105 active:scale-95 transition-transform">
          <CloseMark className="w-6 h-6 text-zinc-400 hover:text-zinc-100" />
        </Link>
      </div>

      <form className="flex flex-col space-y-4 p-6 bg-[#313338]">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400" htmlFor="serverName">
            Server Name
          </label>
          <div className="flex items-center bg-[#1e1f22] border border-[#1f2023] rounded-lg focus-within:border-indigo-500 transition-colors">
            <span className="text-lg px-3 text-zinc-500">#</span>
            <input
              type="text"
              id="serverName"
              name="serverName"
              value={formData.serverName}
              onChange={(e) =>
                setFormData({ ...formData, serverName: e.target.value })
              }
              className="w-full bg-transparent border-none py-2.5 pr-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
              placeholder="e.g. My Awesome Club"
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400" htmlFor="serverImage">
            Image URL
          </label>
          <div className="flex items-center bg-[#1e1f22] border border-[#1f2023] rounded-lg focus-within:border-indigo-500 transition-colors">
            <span className="text-lg px-3 text-zinc-500">📷</span>
            <input
              type="text"
              id="serverImage"
              name="serverImage"
              value={formData.serverImage}
              onChange={(e) =>
                setFormData({ ...formData, serverImage: e.target.value })
              }
              className="w-full bg-transparent border-none py-2.5 pr-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none"
              placeholder="https://example.com/logo.png"
              required
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Add Users</h2>
          <div className="max-h-52 overflow-y-auto bg-[#1e1f22] border border-[#1f2023] rounded-lg p-2 divide-y divide-[#2b2d31]">
            {users.length === 0 ? (
              <div className="text-xs text-zinc-500 py-6 text-center">No other members available</div>
            ) : (
              users.map((user) => (
                <UserRow user={user} userChanged={userChanged} key={user.id} />
              ))
            )}
          </div>
        </div>
      </form>

      <div className="flex space-x-4 items-center justify-end px-6 py-4 bg-[#2b2d31] border-t border-[#1f2023]">
        <Link href="/" className="font-semibold text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
          Cancel
        </Link>
        <button
          type="button"
          disabled={buttonDisabled()}
          className={`bg-indigo-500 hover:bg-indigo-600 rounded py-2 px-5 text-white font-bold text-sm uppercase tracking-wider transition-all cursor-pointer ${
            buttonDisabled() ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
          }`}
          onClick={createClicked}
        >
          Create Server
        </button>
      </div>
    </dialog>
  );
};

export default CreateServerForm;
