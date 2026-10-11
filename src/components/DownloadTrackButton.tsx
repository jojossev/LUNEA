"use client";

export function DownloadTrackButton({
  trackId,
  audioUrl,
  title,
}: {
  trackId: string;
  audioUrl?: string | null;
  title: string;
}) {
  return (
    <button
      type="button"
      className="lunea-btn lunea-btn-primary"
      onClick={async () => {
        const key = localStorage.getItem("lunea_client_key") || crypto.randomUUID();
        localStorage.setItem("lunea_client_key", key);
        const res = await fetch("/api/stats/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId, type: "download", clientKey: key }),
        });
        const data = await res.json();
        const url = data.audioUrl || audioUrl;
        if (url) {
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title}.mp3`;
          a.click();
        }
      }}
    >
      Télécharger MP3
    </button>
  );
}
