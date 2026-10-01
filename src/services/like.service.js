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
