import config from "../Config/Config";
import client from "./client";
import { TablesDB, Query, ID, Permission, Role, Realtime } from "appwrite";

// Anyone may read a like (counts are public); only the person who left it can
// take it back. There is no update — a like is created or removed, never edited.
function likePermissions(userId) {
  return [Permission.read(Role.any()), Permission.delete(Role.user(userId))];
}

class LikeService {
  tablesDB;
  realtime;

  constructor() {
    this.tablesDB = new TablesDB(client);
    this.realtime = new Realtime(client);
  }

  async createLike(userId, postId) {
    try {
      return await this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        rowId: ID.unique(),
        data: { userId, postId },
        permissions: likePermissions(userId),
      });
    } catch (error) {
      console.log(
        "Error occurred while liking a post :: createLike :: like.service.js",
        error,
      );
      throw error;
    }
  }

  async removeLike(likeId) {
    try {
      return await this.tablesDB.deleteRow({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        rowId: likeId,
      });
    } catch (error) {
      console.log(
        "Error occurred while unliking :: removeLike :: like.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * How many likes a post has.
   *
   * `limit(1)` matters: without it Appwrite ships a page of rows we would
   * throw away just to read a number. A post with 10,000 likes costs the same
   * as one with 3.
   */
  async getLikeCount(postId) {
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        queries: [Query.equal("postId", postId), Query.limit(1)],
        total: true,
      });

      return response.total ?? 0;
    } catch (error) {
      console.log(
        "Error occurred while counting likes :: getLikeCount :: like.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * Like counts for a page of cards, as `{ postId: count }`, in one request:
   * the like rows for those posts come back with only their postId and are
   * tallied here. If a page's posts somehow have more likes than one response
   * holds, falls back to counting each post exactly.
   */
  async getLikeCountsByPost(postIds) {
    if (!postIds.length) return {};
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        queries: [
          Query.equal("postId", postIds),
          Query.select(["postId"]),
          Query.limit(5000),
        ],
        total: true,
      });

      if (response.total > response.rows.length) {
        const exact = await Promise.all(postIds.map((id) => this.getLikeCount(id)));
        return Object.fromEntries(postIds.map((id, i) => [id, exact[i]]));
      }

      const counts = Object.fromEntries(postIds.map((id) => [id, 0]));
      for (const row of response.rows) counts[row.postId] += 1;
      return counts;
    } catch (error) {
      console.log(
        "Error occurred while counting likes :: getLikeCountsByPost :: like.service.js",
        error,
      );
      throw error;
    }
  }

  /** One page of the posts a user has liked, most recent like first. */
  async getUserLikes({ userId, lastId = null, limit = 12 }) {
    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.orderDesc("$id"),
      Query.limit(limit),
      Query.select(["$id", "$createdAt", "postId"]),
    ];
    if (lastId) queries.push(Query.cursorAfter(lastId));

    try {
      return await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        queries,
        total: false,
      });
    } catch (error) {
      console.log(
        "Error occurred while fetching liked posts :: getUserLikes :: like.service.js",
        error,
      );
      throw error;
    }
  }

  /** Every like on the platform — one row requested, the total reported. */
  async getTotalLikeCount() {
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        queries: [Query.limit(1), Query.select(["$id"])],
        total: true,
      });
      return response.total ?? 0;
    } catch (error) {
      console.log(
        "Error occurred while counting all likes :: getTotalLikeCount :: like.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * Likes across many posts, leaving out one user's own — "likes received"
   * on a profile shouldn't count the author liking their own work.
   *
   * Appwrite caps the values in a single equal() at 100, so the ids are
   * counted in chunks and summed.
   */
  async getLikeCountForPosts(postIds, excludeUserId) {
    let total = 0;

    try {
      for (let i = 0; i < postIds.length; i += 100) {
        const response = await this.tablesDB.listRows({
          databaseId: config.databaseId,
          tableId: config.liketableId,
          queries: [
            Query.equal("postId", postIds.slice(i, i + 100)),
            Query.notEqual("userId", excludeUserId),
            Query.limit(1),
          ],
          total: true,
        });
        total += response.total ?? 0;
      }
      return total;
    } catch (error) {
      console.log(
        "Error occurred while counting likes :: getLikeCountForPosts :: like.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * This user's like on this post, or null.
   *
   * Returns the row rather than a boolean because unliking needs its $id —
   * a true/false answer tells you the like exists but not how to remove it.
   */
  async getUserLike(userId, postId) {
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.liketableId,
        queries: [
          Query.equal("postId", postId),
          Query.equal("userId", userId),
          Query.limit(1),
        ],
        total: false,
      });

      return response.rows[0] ?? null;
    } catch (error) {
      console.log(
        "Error occurred while checking user like :: getUserLike :: like.service.js",
        error,
      );
      throw error;
    }
  }

  // subscribing a channel

  subscribeToLike(onChange) {
    const channel = `databases.${config.databaseId}.tables.${config.liketableId}.rows`;
    return this.realtime.subscribe(channel, onChange);
  }
}

const likeservice = new LikeService();

export default likeservice;
