import { useQuery } from "@tanstack/react-query";
import commentService from "../../services/comment.service";
import { Loader } from "lucide-react";
import { toast } from "sonner";

function Comment({ postId }) {
  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentService.getComments(postId),

    enabled: !!postId,
  });

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
  toast.error("Failed to load comments", {
    description: error.message,
    duration: 4000,
  });

  return <p>Failed to load comments.</p>;
}
  const comments = data?.rows ?? [];


  
  return (
    <section>
      <h2>Comments ({comments.length})</h2>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <div key={comment.$id}>
              <strong>{comment.userName}</strong>

              <p>{comment.content}</p>

              <small>{new Date(comment.$createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Comment;
