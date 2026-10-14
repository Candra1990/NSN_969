import React from 'react';
import { Apps, FolderPlus, Thread } from '@/components/ChannelList/Icons';
import { ListRowElement } from '@/components/ChannelList/TopBar/menuItems';

export const plusItems: ListRowElement[] = [
  {
    name: 'Upload a File',
    icon: React.createElement(FolderPlus, {}),
    bottomBorder: false,
    reverseOrder: true,
  },
  {
    name: 'Create Thread',
    icon: React.createElement(Thread, {}),
    bottomBorder: false,
    reverseOrder: true,
  },
  {
    name: 'Use Apps',
    icon: React.createElement(Apps, {}),
    bottomBorder: false,
    reverseOrder: true,
  },
];
