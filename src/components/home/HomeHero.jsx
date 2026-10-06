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
    { label: "articles", value: stats.data?.articles },
    { label: "likes", value: stats.data?.likes },
    { label: "comments", value: stats.data?.comments },
  ];

  return (
    <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-8">
      <div className="flex shrink-0 flex-col gap-8 lg:w-[446px]">
        <p className="text-xs font-semibold uppercase text-ink-text-2">
          A blogging platform for curious minds
        </p>
        <h1 className="text-[56px] font-semibold leading-none tracking-[-1.68px] text-ink-text sm:text-[88px] sm:tracking-[-2.64px]">
          Ideas deserve a home.
        </h1>
        <p className="text-sm text-ink-text-2">WRITE. SHARE. DISCOVER. GROW.</p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/add-post"
            className="inline-flex h-12 items-center gap-2 rounded-lg border border-ink-primary bg-ink-primary px-6 text-sm font-semibold text-ink-on-primary transition-opacity hover:opacity-90"
          >
            Start Writing
            <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <Link
            to="/all-posts"
            className="inline-flex h-12 items-center rounded-lg border border-ink-text-2 px-6 text-sm font-semibold text-ink-text transition-colors hover:bg-ink-surface"
          >
            Explore Articles
          </Link>
        </div>

        <dl className="flex gap-4 pt-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col gap-2">
              <dd className="order-1 text-[32px] font-semibold text-ink-text tabular-nums">
                {item.value === undefined ? "—" : compact.format(item.value)}
              </dd>
              <dt className="order-2 text-xs text-ink-text-2">{item.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <figure className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg">
        <img
          src={homeCover}
          alt="Brutalist concrete building against a pale sky"
          className="h-[320px] w-full bg-ink-surface-2 object-cover sm:h-[504px]"
        />
        <figcaption className="flex items-start justify-between gap-4 bg-ink-caption p-4 text-xs text-ink-text-2">
          <span className="truncate leading-[1.5]">
            Good words build a better tomorrow.
          </span>
          <span className="shrink-0">INK / 01</span>
        </figcaption>
      </figure>
    </section>
  );
}

export default HomeHero;
