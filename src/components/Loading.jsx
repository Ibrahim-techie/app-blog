function Loader({ text = "Loading" }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-5">

        <div className="relative h-16 w-16">
          {/* Background ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />

          {/* Animated ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-500" />

          {/* Glow */}
          <div className="absolute inset-3 animate-pulse rounded-full bg-indigo-500/20 blur-lg" />

          {/* Core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30" />
        </div>

        <p className="text-sm font-medium text-gray-600">
          {text}
          <span className="ml-1">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse [animation-delay:200ms]">.</span>
            <span className="animate-pulse [animation-delay:400ms]">.</span>
          </span>
        </p>
      </div>
    </div>
  );
}

export default Loader;