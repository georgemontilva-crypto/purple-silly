import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import "./HomeReels.css";

interface Reel {
  id: number;
  title: string | null;
  videoUrl: string;
  posterUrl: string | null;
}

/**
 * One reel.
 *
 * Autoplay is tied to visibility rather than to page load: four videos all
 * decoding at once on a phone is a lot of work for something most of which
 * is off-screen. An IntersectionObserver starts a clip when its card is
 * actually on screen and pauses it when it leaves, which is also what makes
 * the mobile swipe track behave like a feed.
 *
 * Under prefers-reduced-motion nothing plays on its own — the card shows
 * its poster and a play button, and the visitor decides.
 */
function ReelCard({ reel, autoplay }: { reel: Reel; autoplay: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!autoplay) return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // A rejected play() is normal — a browser can refuse autoplay
            // even muted. Swallowing it leaves the poster up, which is a
            // fine outcome; an unhandled rejection in the console is not.
            el.play().then(
              () => setPlaying(true),
              () => setPlaying(false)
            );
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplay]);

  const handleManualPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.play().then(
      () => setPlaying(true),
      () => setPlaying(false)
    );
  };

  return (
    <div className="reel">
      <video
        ref={videoRef}
        className="reel__video"
        src={reel.videoUrl}
        poster={reel.posterUrl ?? undefined}
        muted
        loop
        // playsInline keeps iOS from hijacking the tap into a full-screen
        // player — without it this is not a reel, it's a video link.
        playsInline
        // No preload until the card is near the viewport; with four clips
        // in a row, preloading metadata for all of them on load is the
        // difference between a fast home page and a slow one.
        preload="none"
        controls={false}
        aria-label={reel.title ?? "Product reel"}
      />

      {/* Shown until something is actually playing: either because
          autoplay is off (reduced motion) or because the browser refused. */}
      {!playing && (
        <button
          type="button"
          className="reel__play"
          onClick={handleManualPlay}
          aria-label={reel.title ? `Play ${reel.title}` : "Play reel"}
        >
          <span>
            <Play size={22} fill="currentColor" aria-hidden="true" />
          </span>
        </button>
      )}

      {reel.title && <p className="reel__title">{reel.title}</p>}
    </div>
  );
}

/**
 * The reels row on the home page, in the slot the stat boxes used to hold.
 *
 * Renders nothing at all when there are no active reels — an empty section
 * with a heading over blank space is worse than no section.
 */
export default function HomeReels() {
  const { data: reels } = trpc.homeReels.listPublic.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const reduceMotion = useReducedMotion() ?? false;

  if (!reels || reels.length === 0) return null;

  return (
    <section className="reels-section" aria-labelledby="home-reels-title">
      <div className="reels-head">
        <p className="reels-eyebrow">In the wild</p>
        <h2 className="reels-title" id="home-reels-title">
          Silly in Motion
        </h2>
      </div>

      {/* The count drives the grid so two or three reels stay their proper
          width instead of stretching across four slots. */}
      <div
        className="reels-track"
        style={{ ["--reels-count" as string]: reels.length }}
      >
        {reels.map(reel => (
          <ReelCard key={reel.id} reel={reel} autoplay={!reduceMotion} />
        ))}
      </div>
    </section>
  );
}
