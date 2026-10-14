import React from 'react';
import { PersonIcon } from '../Icons';

export interface UserObject {
  id: string;
  name: string;
  image?: string;
  lastOnline?: string;
}

export default function UserRow({
  user,
  userChanged,
}: {
  user: UserObject;
  userChanged: (user: UserObject, checked: boolean) => void;
}) {
  return (
    <div className='flex items-center justify-start w-full space-x-4 my-2 p-1.5 hover:bg-gray-800 rounded transition'>
      <input
        id={user.id}
        type='checkbox'
        name={user.id}
        className='w-4 h-4 text-cyan-500 rounded border-gray-600 focus:ring-cyan-500 bg-gray-900 cursor-pointer'
        onChange={(event) => {
          userChanged(user, event.target.checked);
        }}
      />
      <label className='w-full flex items-center space-x-3 cursor-pointer select-none text-left' htmlFor={user.id}>
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className='w-8 h-8 rounded-full border border-gray-700 bg-gray-950 object-cover'
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
            <PersonIcon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className='block text-gray-200 text-sm truncate font-medium'>{user.name}</span>
          {user.lastOnline && (
            <span className='text-[10px] text-gray-500 block font-mono'>
              Online: {user.lastOnline.split('T')[0]}
            </span>
          )}
        </div>
      </label>
    </div>
  );
}
