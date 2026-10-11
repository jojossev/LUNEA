export type TrackView = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  genre: string;
  year: number;
  duration: string;
  plays: number;
  downloads: number;
  cover: string;
  audioUrl?: string | null;
  statusLabel?: string;
  tagsList?: string[];
};
