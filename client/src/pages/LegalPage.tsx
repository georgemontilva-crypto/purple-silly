import { useParams } from "wouter";
import NotFound from "@/pages/NotFound";
import { POLICIES } from "@/content/policies";
import { AmbientGlow } from "@/components/motion/AmbientGlow";
import "./LegalPage.css";

/**
 * Renders one of the client's legal policies.
 *
 * The words come from content/policies.ts and are the client's own,
 * verbatim. This file owns only how they look — measure, rhythm, contrast.
 * Nothing here transforms the text: no truncation, no title-casing, no
 * "read more". A legal page that hides half its content is worse than no
 * legal page.
 */
export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const policy = slug ? POLICIES[slug] : undefined;

  // An unknown /policies/* slug is a 404, not an empty shell with a
  // heading — the same treatment any other bad route gets.
  if (!policy) return <NotFound />;

  return (
    <div className="legal-page ambient-glow-host">
      <AmbientGlow variant="c" />

      <main className="legal-page__inner">
        <header className="legal-page__head">
          <p className="legal-page__eyebrow">Purple Organics</p>
          <h1 className="legal-page__title">{policy.title}</h1>
        </header>

        <article className="legal-page__body">
          {policy.blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="legal-heading">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="legal-list">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="legal-paragraph">
                {block.text}
              </p>
            );
          })}
        </article>
      </main>
    </div>
  );
}
