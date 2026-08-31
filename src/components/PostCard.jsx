import fileservice from "../services/storage.service";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage }) {

  return (
    <Link
      to={`/post/${$id}`}
      className="group block w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image Section */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={fileservice.filePreview(featuredImage)}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:opacity-100"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

     
      <div className="p-5">
        <h2 className="line-clamp-2 text-lg font-semibold leading-7 text-gray-900 transition-colors duration-200 group-hover:text-indigo-600">
          {title}
        </h2>

        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Read article
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
