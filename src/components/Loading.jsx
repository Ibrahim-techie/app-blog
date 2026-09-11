function Loader({ text = "Loading", compact = false, className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${compact ? "gap-3 px-5 py-3" : "min-h-[60vh] flex-col gap-3 px-6 py-12"} ${className}`}
    >

        <div className={`relative shrink-0 ${compact ? "h-12 w-12" : "h-32 w-32"}`} aria-hidden="true">
          <div className={`absolute inset-0 flex items-center justify-center ${compact ? "scale-[0.35]" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="morph-loading-shape absolute h-4 w-4 bg-indigo-600 dark:bg-indigo-400"
                style={{
                  animation: `morph-${i} 2s infinite ease-in-out`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-sm font-medium tracking-wide text-slate-600 dark:text-slate-300">
          {text}
          <span aria-hidden="true">…</span>
        </p>
    </div>
  );
}

export default Loader;
