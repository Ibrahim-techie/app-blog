import CommentItem from "./CommentItem";

/** Presentational: turns a list of comments into rows. No data fetching here. */
function CommentList({ comments, postId }) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {comments.map((comment) => (
        <li key={comment.$id} className="py-5 first:pt-0 last:pb-0">
          <CommentItem comment={comment} postId={postId} />
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
