import client from "./client";
import config from "../Config/Config";

import { TablesDB, Query, ID, Permission, Role, Realtime } from "appwrite";

function commentPermissions(userId) {
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

class CommentService {
  tablesDB;
  realtime;

  constructor() {
    this.tablesDB = new TablesDB(client);
    this.realtime = new Realtime(client);
  }

  // Create a new comment
  async createComment({ userId, userName, content, postId }) {
    try {
      return await this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        rowId: ID.unique(),

        data: {
          postId,
          userId,
          userName,
          content,
        },

        permissions: commentPermissions(userId),
      });
    } catch (error) {
      console.log(
        "Error occurred while creating a comment :: createComment :: comment.service.js",
        error,
      );

      throw error;
    }
  }

  // One page of comments for a post, newest first.
  //
  // Paginated by cursor rather than page number for the same reason the post
  // feed is: someone commenting while you read would shift every later row and
  // make an offset-based page repeat or skip one. `$id` breaks ties between
  // comments created in the same millisecond.
  async getComments({ postId, lastId = null, limit = 10 }) {
    const queries = [
      Query.equal("postId", postId),
      Query.orderDesc("$createdAt"),
      Query.orderDesc("$id"),
      Query.limit(limit),
    ];

    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    try {
      return await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        queries,
        // The header shows a real count, not "the number loaded so far".
        total: true,
      });
    } catch (error) {
      console.log(
        "Error occurred while fetching comments :: getComments :: comment.service.js",
        error,
      );

      throw error;
    }
  }

  // Comment counts for a page of cards, as { postId: count } — one request,
  // the same approach as getLikeCountsByPost in like.service.js.
  async getCommentCountsByPost(postIds) {
    if (!postIds.length) return {};
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        queries: [
          Query.equal("postId", postIds),
          Query.select(["postId"]),
          Query.limit(5000),
        ],
        total: true,
      });

      if (response.total > response.rows.length) {
        const exact = await Promise.all(
          postIds.map((id) => this.getCommentCount(id)),
        );
        return Object.fromEntries(postIds.map((id, i) => [id, exact[i]]));
      }

      const counts = Object.fromEntries(postIds.map((id) => [id, 0]));
      for (const row of response.rows) counts[row.postId] += 1;
      return counts;
    } catch (error) {
      console.log(
        "Error occurred while counting comments :: getCommentCountsByPost :: comment.service.js",
        error,
      );
      throw error;
    }
  }

  // How many comments one post has — one row requested, the total reported.
  async getCommentCount(postId) {
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        queries: [
          Query.equal("postId", postId),
          Query.limit(1),
          Query.select(["$id"]),
        ],
        total: true,
      });
      return response.total ?? 0;
    } catch (error) {
      console.log(
        "Error occurred while counting comments :: getCommentCount :: comment.service.js",
        error,
      );
      throw error;
    }
  }

  // Every comment on the platform — one row requested, the total reported.
  async getTotalCommentCount() {
    try {
      const response = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        queries: [Query.limit(1), Query.select(["$id"])],
        total: true,
      });
      return response.total ?? 0;
    } catch (error) {
      console.log(
        "Error occurred while counting all comments :: getTotalCommentCount :: comment.service.js",
        error,
      );
      throw error;
    }
  }

  // Comments across many posts, leaving out one user's own replies. Chunked by
  // 100 ids for the same reason as getLikeCountForPosts in like.service.js.
  async getCommentCountForPosts(postIds, excludeUserId) {
    let total = 0;

    try {
      for (let i = 0; i < postIds.length; i += 100) {
        const response = await this.tablesDB.listRows({
          databaseId: config.databaseId,
          tableId: config.commenttableId,
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
        "Error occurred while counting comments :: getCommentCountForPosts :: comment.service.js",
        error,
      );
      throw error;
    }
  }

  // Update a comment
  async updateComment({ commentId, content }) {
    try {
      return await this.tablesDB.updateRow({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        rowId: commentId,

        data: {
          content,
        },
      });
    } catch (error) {
      console.log(
        "Error occurred while updating a comment :: updateComment :: comment.service.js",
        error,
      );

      throw error;
    }
  }

  /**
   * Listen for comment changes made by anyone, in any browser.
   *
   * TanStack Query's cache is per browser tab, so a comment deleted on one
   * machine is invisible to another until that tab refetches. Appwrite pushes
   * create/update/delete events over a websocket, which closes that gap.
   *
   * Resolves to the subscription — unsubscribe on unmount via
   * subscribeWithCleanup() in utils/realtime.js.
   */
  subscribeToComments(onChange) {
    const channel = `databases.${config.databaseId}.tables.${config.commenttableId}.rows`;
    return this.realtime.subscribe(channel, onChange);
  }

  // Delete a comment
  async deleteComment(commentId) {
    try {
      return await this.tablesDB.deleteRow({
        databaseId: config.databaseId,
        tableId: config.commenttableId,
        rowId: commentId,
      });
    } catch (error) {
      console.log(
        "Error occurred while deleting a comment :: deleteComment :: comment.service.js",
        error,
      );

      throw error;
    }
  }
}

const commentService = new CommentService();

export default commentService;
