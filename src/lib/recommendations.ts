import type { TrackView, TrackWithArtist } from "./types";

/**
 * Système de recommandation de musique intelligente
 * Basé sur les tags, genre et historique d'écoute
 */

export interface ListenHistory {
  trackId: string;
  timestamp: number;
  genre: string;
  tags: string[];
}

const MAX_HISTORY = 50;

/**
 * Récupère l'historique d'écoute depuis localStorage
 */
export function getListenHistory(): ListenHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("lunea_listen_history");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde une écoute dans l'historique
 */
export function saveListen(track: TrackView) {
  const history = getListenHistory();
  const entry: ListenHistory = {
    trackId: track.id,
    timestamp: Date.now(),
    genre: track.genre,
    tags: track.tagsList || [],
  };

  // Ajouter au début et limiter à MAX_HISTORY
  const updated = [entry, ...history.filter((h) => h.trackId !== track.id)].slice(0, MAX_HISTORY);
  localStorage.setItem("lunea_listen_history", JSON.stringify(updated));
}

/**
 * Calcule le score de pertinence d'une musique pour l'utilisateur
 */
function calculateRelevanceScore(
  track: TrackView,
  history: ListenHistory[]
): number {
  if (history.length === 0) return 0;

  let score = 0;
  const tags = track.tagsList || [];
  const recentHistory = history.slice(0, 20); // Dernières 20 écoutes

  // Poids du genre (30%)
  const genreMatches = recentHistory.filter((h) => h.genre === track.genre).length;
  score += genreMatches * 30;

  // Poids des tags (70%)
  for (const tag of tags) {
    const tagMatches = recentHistory.filter((h) => h.tags.includes(tag)).length;
    score += tagMatches * 15;
  }

  // Bonus pour les écoutes très récentes (aujourd'hui)
  const today = new Date().toDateString();
  const todayPlays = recentHistory.filter((h) => new Date(h.timestamp).toDateString() === today);
  score += todayPlays.length * 5;

  // Pénalité si déjà écouté récemment
  const recentSameTrack = recentHistory.find((h) => h.trackId === track.id);
  if (recentSameTrack) {
    const hoursSince = (Date.now() - recentSameTrack.timestamp) / (1000 * 60 * 60);
    if (hoursSince < 1) score -= 50; // Écoute il y a moins d'une heure
    else if (hoursSince < 24) score -= 20; // Écoute il y a moins de 24h
  }

  return score;
}

/**
 * Recommande la prochaine musique intelligente
 */
export function getNextRecommendation(
  tracks: TrackView[],
  currentTrackId: string | null
): TrackView | null {
  const history = getListenHistory();
  const candidates = tracks.filter((t) => t.id !== currentTrackId);

  if (candidates.length === 0) return null;

  // Si pas d'historique, recommander aléatoirement
  if (history.length === 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  // Calculer les scores pour tous les candidats
  const scored = candidates.map((track) => ({
    track,
    score: calculateRelevanceScore(track, history),
  }));

  // Trier par score décroissant
  scored.sort((a, b) => b.score - a.score);

  // Renvoyer le meilleur score
  return scored[0]?.track || null;
}

/**
 * Recommande une playlist basée sur une musique donnée
 */
export function getRecommendationsForTrack(
  track: TrackView | TrackWithArtist,
  allTracks: TrackView[] | TrackWithArtist[],
  limit: number = 5
): TrackView[] {
  const candidates = allTracks.filter((t) => t.id !== track.id);
  const genre = track.genre;
  const tags = track.tagsList || [];

  // Priorité : même genre + tags communs
  const scored = candidates.map((t) => {
    let score = 0;

    // Même genre
    if (t.genre === genre) score += 30;

    // Tags communs
    const commonTags = (t.tagsList || []).filter((tag) => tags.includes(tag));
    score += commonTags.length * 15;

    // Popularité (lectures)
    score += Math.min(t.plays / 10000, 20);

    return { track: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.track);
}
