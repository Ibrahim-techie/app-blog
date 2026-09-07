
import fileservice from "../services/storage.service";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage, author }) {
  return (
    <Link
      to={`/post/${$id}`}
      className="
        group relative flex h-full flex-col overflow-hidden rounded-3xl
        border border-gray-200/70 bg-white
        shadow-[0_4px_20px_rgba(0,0,0,0.04)]
        transition-all duration-500
        hover:-translate-y-2
        hover:border-gray-300
        hover:shadow-[0_20px_45px_rgba(0,0,0,0.10)]
      "
    >
      {/* Image */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-100">
        <img
          src={fileservice.filePreview(featuredImage)}
          alt={title}
          className="
            h-full w-full object-cover
            transition-transform duration-700 ease-out
            group-hover:scale-105
          "
        />

        {/* Image Overlay */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/50 via-black/5 to-transparent
            opacity-70
            transition-opacity duration-500
            group-hover:opacity-90
          "
        />

        {/* Read badge */}
        <div
          className="
            absolute left-4 top-4
            rounded-full
            bg-white/90 px-3 py-1.5
            text-xs font-semibold text-gray-800
            shadow-sm backdrop-blur-md
          "
        >
          Article
        </div>

        {/* Arrow */}
        <div
          className="
            absolute bottom-4 right-4
            flex h-10 w-10 items-center justify-center
            rounded-full
            bg-white/90
            text-lg text-gray-800
            shadow-md backdrop-blur-md
            transition-all duration-300
            group-hover:bg-indigo-600
            group-hover:text-white
            group-hover:rotate-[-45deg]
          "
        >
          →
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title */}
        <h2
          className="
            line-clamp-2
            text-xl font-bold leading-7
            tracking-tight text-gray-900
            transition-colors duration-300
            group-hover:text-indigo-600
          "
        >
          {title}
        </h2>

        {/* Divider */}
        <div className="my-5 h-px w-full bg-gray-100" />

        {/* Author / Read */}
        <div className="mt-auto flex items-center justify-between">
          {/* Author */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full
                bg-gradient-to-br from-indigo-500 to-purple-600
                text-sm font-bold text-white
              "
            >
              {author?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Written by
              </p>

              <p className="truncate text-sm font-semibold text-gray-700">
                {author || "Anonymous"}
              </p>
            </div>
          </div>

          {/* Read */}
          <span
            className="
              shrink-0 text-sm font-semibold
              text-gray-500
              transition-colors duration-300
              group-hover:text-indigo-600
            "
          >
            Read
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;

