import { Star } from "lucide-react";

const reviews = [
  {
    name: "Sarah M.",
    age: 34,
    verified: true,
    rating: 5,
    text: "I've been grabbing these every weekend and they never disappoint. These three are hands down my favorite flavors, the taste is super consistent and exactly what you'd want. If you haven't tried them yet, I highly recommend!",
  },
  {
    name: "Jessica T.",
    age: 29,
    verified: true,
    rating: 5,
    text: "These go everywhere with me. My friends and I bring them on every trail day and they've completely replaced pre-workout and coffee for us. Steady energy the whole hike. Just good vibes and a great time with the group.",
  },
  {
    name: "Marcus R.",
    age: 26,
    verified: true,
    rating: 5,
    text: "Honestly didn't expect much but these blew me away. The mood lift is real and there's no jittery feeling at all. Perfect for a night out or just hanging with friends. Will definitely be ordering again.",
  },
  {
    name: "Kayla B.",
    age: 31,
    verified: true,
    rating: 5,
    text: "I was skeptical at first but after the first pack I was hooked. The focus and social ease is unreal. I take them before work events and they make everything so much smoother. Game changer.",
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-16 md:py-24 bg-[oklch(0.97_0.005_265)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-[oklch(0.22_0.08_265)] tracking-tight mb-2">
            Real Riders
          </h2>
          <p className="text-gray-500 text-base">
            Don't take our word for it; hear from real people who ride the
            Wheel.
          </p>
        </div>
        {/* Below sm this is a horizontal swipe track that snaps review to
            review with the scrollbar hidden; from sm up it goes back to the
            grid. One review per screen beats a single column the reader has
            to scroll four card-heights through. */}
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0">
          {reviews.map(({ name, age, verified, rating, text }) => (
            <div
              key={name}
              className="snap-start shrink-0 w-[80%] max-w-[300px] sm:w-auto sm:max-w-none bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3"
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i <= rating
                        ? "fill-[oklch(0.92_0.18_95)] text-[oklch(0.92_0.18_95)]"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                "{text}"
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.22_0.08_265)] flex items-center justify-center text-white text-xs font-bold">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-[oklch(0.22_0.08_265)]">
                    {name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {age} · {verified && "✓ Verified Buyer"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
