export interface Backsound {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  url?: string;
  duration?: string;
  coverUrl?: string;
  createdAt?: unknown;
}

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  tag: string;
}
