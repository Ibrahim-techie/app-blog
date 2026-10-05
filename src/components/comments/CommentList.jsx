import CommentItem from "./CommentItem";

/** Presentational: turns a list of comments into rows. No data fetching here. */
function CommentList({ comments, postId }) {
  return (
    <ul className="flex flex-col">
      {comments.map((comment) => (
        <li key={comment.$id} className="border-b border-ink-border py-6">
          <CommentItem comment={comment} postId={postId} />
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
