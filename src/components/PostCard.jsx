import fileservice from "../services/storage.service";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage }) {
  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow duration-200">
        {/* Image Section */}
        <div className="w-full flex justify-center mb-4 ">
          <img
            src={fileservice.filePreview(featuredImage)} 
            height="20px"
            alt={title}
            className="rounded-xl object-cover h-48 w-full"
          />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {title}
        </h2>
      </div>
    </Link>
  );
}

export default PostCard;
