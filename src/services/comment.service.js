import client from "./client";
import config from "../Config/Config";

import { TablesDB, Query, ID, Permission, Role } from "appwrite";

function commentPermissions(userId) {
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

class CommentService {
  tablesDB;

  constructor() {
    this.tablesDB = new TablesDB(client);
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
   * Returns the unsubscribe function — call it on unmount.
   */
  subscribeToComments(onChange) {
    const channel = `databases.${config.databaseId}.tables.${config.commenttableId}.rows`;
    return client.subscribe(channel, onChange);
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
