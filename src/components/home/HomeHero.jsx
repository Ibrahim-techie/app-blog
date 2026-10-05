import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import homeCover from "../../assets/home-cover.jpg";
import { useSiteStats } from "../../customHooks/useSiteStats";

const compact = new Intl.NumberFormat("en", { notation: "compact" });

/**
 * The editorial hero: headline, the two calls to action, real platform
 * numbers and the cover photograph from the INK design.
 */
function HomeHero() {
  const stats = useSiteStats();

  // The design's "10K+ writers / 50K+ articles / 100K+ readers" are
  // placeholders. These are counted from Appwrite instead; writers and
  // readers aren't measurable from the browser, so likes and comments
  // take their places.
  const items = [
    { label: "PUBLISHED ARTICLES", value: stats.data?.articles },
    { label: "LIKES", value: stats.data?.likes },
    { label: "COMMENTS", value: stats.data?.comments },
  ];

  return (
    <section className="flex flex-col gap-10 border-b border-ink-border pb-10 xl:flex-row xl:items-start">
      <div className="flex shrink-0 flex-col gap-6 xl:w-[560px]">
        <p className="font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-brand">
          A BLOGGING PLATFORM FOR CURIOUS MINDS
        </p>
        <h1 className="text-[56px] font-extrabold leading-[0.98] tracking-[-3.36px] text-ink-text sm:text-[84px] sm:tracking-[-5.04px]">
          IDEAS
          <br />
          DESERVE
          <br />
          A HOME.
        </h1>
        <p className="font-mono text-xs font-medium tracking-[0.96px] text-ink-text-2">
          WRITE. SHARE. DISCOVER. GROW.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/add-post"
            className="inline-flex h-12 items-center gap-3 rounded-[3px] border border-ink-border-strong bg-ink-primary px-5 text-xs font-extrabold text-ink-on-primary"
          >
            Start Writing
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link
            to="/all-posts"
            className="inline-flex h-12 items-center rounded-[3px] border border-ink-border bg-ink-surface px-5 text-xs font-extrabold text-ink-text transition-colors hover:border-ink-border-strong"
          >
            Explore Articles
          </Link>
        </div>

        <dl className="flex flex-wrap gap-8 pt-3">
          {items.map((item) => (
            <div key={item.label} className="flex w-[124px] flex-col gap-0.5">
              <dd className="order-1 text-xl font-extrabold text-ink-text tabular-nums">
                {item.value === undefined ? "—" : compact.format(item.value)}
              </dd>
              <dt className="order-2 font-mono text-[10px] leading-[1.5] tracking-[0.3px] text-ink-muted">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <figure className="flex h-[360px] min-w-0 flex-1 flex-col overflow-hidden rounded-[2px] bg-ink-surface-2 sm:h-[520px]">
        <img
          src={homeCover}
          alt="Brutalist concrete building against a pale sky"
          className="min-h-0 w-full flex-1 object-cover"
        />
        <figcaption className="flex h-[46px] shrink-0 items-center justify-between gap-4 bg-ink-caption px-4 font-mono text-[10px] leading-[1.5] tracking-[0.3px]">
          <span className="truncate text-ink-on-primary">
            GOOD WORDS BUILD A BETTER TOMORROW.
          </span>
          <span className="shrink-0 text-ink-sage">INK / 01</span>
        </figcaption>
      </figure>
    </section>
  );
}

export default HomeHero;
