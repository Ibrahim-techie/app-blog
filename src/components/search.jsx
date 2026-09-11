import  { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SearchIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{
        duration: 0.3,
        type: "spring",
        bounce: 0.3,
      }}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-500"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </motion.svg>
  );
};

const GooeySearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
}) => {
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Focus input after opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="flex w-full items-center justify-center py-2">
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? 360 : 120,
        }}
        transition={{
          duration: 0.5,
          type: "spring",
          bounce: 0.2,
        }}
        className="
          relative
          flex
          h-14
          items-center
          overflow-hidden
          rounded-full
          border
          border-slate-200
          bg-white
          shadow-md
          shadow-slate-200/60
          dark:border-slate-700
          dark:bg-slate-900
          dark:shadow-black/20
        "
      >
        {/* Search Icon */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -15,
              }}
              transition={{
                duration: 0.25,
              }}
              className="
                pointer-events-none
                absolute
                left-5
                z-10
                flex
                items-center
              "
            >
              <SearchIcon />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closed State */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="button"
              type="button"
              onClick={handleOpen}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
              "
            >
              Search
            </motion.button>
          ) : (
            /* Open State */
            <motion.div
              key="input"
              initial={{
                opacity: 0,
                x: 10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              className="flex h-full w-full items-center pl-12 pr-5"
            >
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                aria-label="Search"
                className="
                  h-full
                  w-full
                  bg-transparent
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  dark:text-white
                  dark:placeholder:text-slate-500
                "
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GooeySearchBar;