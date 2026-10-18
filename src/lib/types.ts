export type TrackView = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artist?: {
    id: string;
    name: string;
    slug?: string | null;
  };
  genre: string;
  year: number;
  duration: string;
  plays: number;
  downloads: number;
  cover: string;
  audioUrl?: string | null;
  statusLabel?: string;
  tagsList?: string[];
  description?: string | null;
  lyrics?: string | null;
};

export type TrackWithArtist = TrackView & {
  description?: string | null;
  lyrics?: string | null;
};
