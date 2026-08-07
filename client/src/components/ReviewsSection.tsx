import { BadgeCheck, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { AmbientGlow } from "@/components/motion/AmbientGlow";

const C = {
  deep: "oklch(0.09 0.04 295)",
  dark: "oklch(0.13 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  vivid: "oklch(0.52 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
  star: "oklch(0.88 0.20 95)",
};

/**
 * Store-wide rating shown in the header.
 *
 * Hard-coded on purpose: it is the aggregate from the review platform the
 * shop actually runs on, covering far more reviews than the handful
 * featured here. Deriving it from the rows below would print "5.00/5 · 5
 * reviews", which is both a different number and a less honest one.
 * Replaced by the official widget's own figure when that lands.
 */
const OVERALL = { score: "4.73", outOf: 5, count: 897 };

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          aria-hidden="true"
          style={
            i <= rating
              ? { fill: C.star, color: C.star }
              : { fill: "oklch(0.30 0.04 295)", color: "oklch(0.30 0.04 295)" }
          }
        />
      ))}
    </div>
  );
}

interface ReviewCardData {
  id: number;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  productName: string | null;
  verified: boolean;
  imageUrl: string | null;
}

function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article
      className="snap-start shrink-0 w-[82%] max-w-[320px] sm:w-auto sm:max-w-none rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: C.dark,
        border: "1px solid oklch(0.52 0.28 295 / 25%)",
        boxShadow: "0 8px 32px oklch(0.20 0.10 295 / 30%)",
      }}
    >
      {/* Photo on top rather than beside the text: these cards sit in a
          narrow column (four or five across on desktop, one per screen on a
          phone), and a side-by-side image would leave neither half a usable
          width. Fixed aspect so a row of cards with and without photos
          still lines up. */}
      {review.imageUrl && (
        <div
          className="aspect-[4/3] overflow-hidden"
          style={{ background: C.mid }}
        >
          <img
            src={review.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex flex-col gap-2.5 flex-1">
        <Stars rating={review.rating} />

        <h3 className="font-bold text-base text-white leading-snug">
          {review.title}
        </h3>

        <p
          className="text-sm leading-relaxed flex-1"
          style={{ color: "oklch(0.72 0.06 295)" }}
        >
          {review.body}
        </p>

        {review.productName && (
          <p className="text-xs font-semibold" style={{ color: C.pink }}>
            {review.productName}
          </p>
        )}

        <div
          className="flex items-center gap-2 flex-wrap pt-3 mt-auto"
          style={{ borderTop: "1px solid oklch(0.30 0.08 295 / 60%)" }}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: C.vivid }}
          >
            {review.authorName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-bold text-white">
            {review.authorName}
          </span>
          {review.verified && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-extrabold"
              style={{
                background: "oklch(0.60 0.17 150 / 20%)",
                border: "1px solid oklch(0.60 0.17 150 / 45%)",
                color: "oklch(0.82 0.15 150)",
              }}
            >
              <BadgeCheck size={11} aria-hidden="true" /> Verified
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Customer reviews on the home page, managed from /admin.
 *
 * Renders nothing at all when there are no active reviews — an empty
 * section with a heading over blank space is worse than no section.
 */
export default function ReviewsSection() {
  const { data: reviews } = trpc.reviews.listPublic.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="ambient-glow-host py-16 md:py-24 px-4 sm:px-6"
      style={{ background: C.deep }}
      aria-labelledby="reviews-title"
    >
      <AmbientGlow variant="b" />

      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h2
            className="font-condensed font-black text-4xl md:text-5xl text-white tracking-tight mb-3"
            id="reviews-title"
          >
            Real Riders
          </h2>

          {/* Store-wide score, not the average of the cards below it. */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <Stars rating={5} size={18} />
            <p className="text-base font-bold text-white">
              {OVERALL.score}/{OVERALL.outOf}
              <span className="mx-1.5" style={{ color: C.pink }}>
                ·
              </span>
              <span style={{ color: "oklch(0.72 0.06 295)" }}>
                {OVERALL.count.toLocaleString("en-US")} reviews
              </span>
            </p>
          </div>
        </div>

        {/* Below sm this is a horizontal swipe track that snaps review to
            review with the scrollbar hidden; from sm up it's a grid. The
            column count tops out at 5 and only applies from xl, so four
            reviews don't get stretched across five slots. */}
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-x-visible sm:pb-0 items-stretch">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
