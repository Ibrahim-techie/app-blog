import config from "../Config/Config";
import client from "./client";
import { TablesDB, Query, ID, Permission, Role } from "appwrite";

// A saved post is private: only the person who saved it can see it or remove
// it. There is no update — a save is created or deleted, never edited. Create
// is granted at the table level, so it is not repeated on the row.
function savedPostPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

class SavedService {
  tablesDB;

  constructor() {
    this.tablesDB = new TablesDB(client);
  }

  /**
   * Save a post for a user.
   *
   * The table's unique (userId, postId) index rejects a second save of the
   * same post with a 409, so duplicates are impossible at the database level
   * rather than relying on the UI.
   */
  async createSavedPost(userId, postId) {
    try {
      return await this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.savedtableId,
        rowId: ID.unique(),
        data: { userId, postId },
        permissions: savedPostPermissions(userId),
      });
    } catch (error) {
      console.log(
        "Error occurred while saving a post :: createSavedPost :: saved.service.js",
        error,
      );
      throw error;
    }
  }

  /** Remove a save. Deletes only the savedPosts row — never the post itself. */
  async deleteSavedPost(savedId) {
    try {
      return await this.tablesDB.deleteRow({
        databaseId: config.databaseId,
        tableId: config.savedtableId,
        rowId: savedId,
      });
    } catch (error) {
      console.log(
        "Error occurred while unsaving a post :: deleteSavedPost :: saved.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * This user's saved row for this post, or null.
   *
   * Returns the row rather than a boolean because unsaving needs its $id — a
   * true/false answer says the save exists but not how to remove it. Same
   * reasoning as getUserLike in like.service.js.
   */
  async getUserSavedPost(userId, postId) {
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.savedtableId,
        queries: [
          Query.equal("userId", userId),
          Query.equal("postId", postId),
          Query.limit(1),
        ],
        total: false,
      });

      return response.rows[0] ?? null;
    } catch (error) {
      console.log(
        "Error occurred while checking saved post :: getUserSavedPost :: saved.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * One page of a user's saves, most recently saved first.
   *
   * Paginated by cursor like the post feed, so someone with hundreds of saves
   * costs the same per page as someone with three. Only the fields needed to
   * look the posts up are selected — the rows are pure userId/postId links.
   */
  async getSavedPosts({ userId, lastId = null, limit = 12 }) {
    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.orderDesc("$id"),
      Query.limit(limit),
      Query.select(["$id", "$createdAt", "postId"]),
    ];

    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    try {
      return await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.savedtableId,
        queries,
        total: false,
      });
    } catch (error) {
      console.log(
        "Error occurred while fetching saved posts :: getSavedPosts :: saved.service.js",
        error,
      );
      throw error;
    }
  }
}

const savedservice = new SavedService();

export default savedservice;
