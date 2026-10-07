import { AppwriteException, Client, Permission, Role, TablesDB } from "node-appwrite";

// tablesdb.<databaseId>.tables.<tableId>.rows.<rowId>.<create|delete>
const ROW_EVENT = /^tablesdb\.([^.]+)\.tables\.([^.]+)\.rows\.([^.]+)\.(create|delete)$/;

const EXCERPT_LENGTH = 140;

const { POSTS_TABLE_ID, LIKES_TABLE_ID, COMMENTS_TABLE_ID, NOTIFICATIONS_TABLE_ID } =
  process.env;

// The first 140 characters of a comment, cut on whole characters so an emoji
// is never split in half.
function excerptOf(text = "") {
  const chars = Array.from(text.trim());
  return chars.length > EXCERPT_LENGTH
    ? `${chars.slice(0, EXCERPT_LENGTH - 1).join("")}…`
    : chars.join("");
}

const isCode = (code) => (error) =>
  error instanceof AppwriteException && error.code === code;

/**
 * Turns a like or a comment into a notification for the post's author.
 *
 * Runs on row events only — nobody can call it directly — and writes with the
 * execution's own short-lived key, so notifications can't be forged from a
 * browser. A failure here never touches the like or comment that caused it.
 *
 * Notification ids come from the row that caused them (`like_<likeId>`,
 * `comment_<commentId>`), so a redelivered event finds the row already there
 * instead of notifying twice, and an unlike or a deleted comment knows exactly
 * which one to remove.
 */
export default async ({ req, res, log, error }) => {
  const match = ROW_EVENT.exec(req.headers["x-appwrite-event"] ?? "");
  if (!match) return res.json({ skipped: "not a row create/delete event" });

  const [, databaseId, tableId, , action] = match;
  const type =
    tableId === LIKES_TABLE_ID ? "like" : tableId === COMMENTS_TABLE_ID ? "comment" : null;
  if (!type) return res.json({ skipped: `unwatched table ${tableId}` });

  const row = req.bodyJson ?? req.body;
  const notificationId = `${type}_${row.$id}`;

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"]);
  const tablesDB = new TablesDB(client);

  // The like or comment is gone, so its notification goes too.
  if (action === "delete") {
    try {
      await tablesDB.deleteRow({
        databaseId,
        tableId: NOTIFICATIONS_TABLE_ID,
        rowId: notificationId,
      });
      return res.json({ deleted: notificationId });
    } catch (err) {
      if (isCode(404)(err)) return res.json({ skipped: "no notification to remove" });
      error(`delete ${notificationId}: ${err.message}`);
      throw err;
    }
  }

  let post;
  try {
    post = await tablesDB.getRow({ databaseId, tableId: POSTS_TABLE_ID, rowId: row.postId });
  } catch (err) {
    if (isCode(404)(err)) return res.json({ skipped: "post no longer exists" });
    throw err;
  }

  const recipientId = post.userID;
  if (!recipientId || recipientId === row.userId) {
    return res.json({ skipped: "author acting on their own post" });
  }

  try {
    await tablesDB.createRow({
      databaseId,
      tableId: NOTIFICATIONS_TABLE_ID,
      rowId: notificationId,
      data: {
        recipientId,
        actorId: row.userId,
        type,
        postId: post.$id,
        postTitle: String(post.title ?? "").slice(0, 255),
        excerpt: type === "comment" ? excerptOf(row.content) : null,
        read: false,
      },
      // Only the author sees it, marks it read or clears it.
      permissions: [
        Permission.read(Role.user(recipientId)),
        Permission.update(Role.user(recipientId)),
        Permission.delete(Role.user(recipientId)),
      ],
    });
  } catch (err) {
    if (isCode(409)(err)) return res.json({ skipped: "already notified" });
    error(`create ${notificationId}: ${err.message}`);
    throw err;
  }

  log(`${type} on ${post.$id} → notified ${recipientId}`);
  return res.json({ created: notificationId });
};
