/** Published posts / likes received / comments received. */
function ProfileStats({ stats, isPending, isError, isFetching, onRetry }) {
  const items = [
    { label: "Published posts", value: stats?.posts },
    { label: "Likes received", value: stats?.likes },
    { label: "Comments received", value: stats?.comments },
  ];

  return (
    <section aria-label="Profile statistics" className="py-10">
      <dl className="grid grid-cols-1 border border-writr-border sm:grid-cols-3 dark:border-gray-800">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`bg-writr-surface px-6 py-5 dark:bg-gray-900 ${
              index > 0
                ? "border-t border-writr-border sm:border-t-0 sm:border-l dark:border-gray-800"
                : ""
            }`}
          >
            <dt className="text-xs font-medium uppercase tracking-[0.15em] text-writr-muted dark:text-gray-500">
              {item.label}
            </dt>
            <dd className="mt-2 font-serif text-4xl tabular-nums text-writr-text dark:text-white">
              {isPending || isError ? (
                <span className="text-writr-border dark:text-gray-700">—</span>
              ) : (
                item.value.toLocaleString()
              )}
            </dd>
          </div>
        ))}
      </dl>

      {isError && (
        <p role="alert" className="mt-3 text-sm text-writr-text-2 dark:text-gray-400">
          Couldn&apos;t load your statistics.{" "}
          <button
            type="button"
            onClick={onRetry}
            disabled={isFetching}
            className="font-medium text-writr-text underline underline-offset-4 disabled:opacity-60 dark:text-gray-200"
          >
            {isFetching ? "Retrying…" : "Retry"}
          </button>
        </p>
      )}
    </section>
  );
}

export default ProfileStats;
