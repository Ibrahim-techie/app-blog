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

  // Get all comments for an article
  async getComments(postId) {
    try {
      return await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.commenttableId,

        queries: [Query.equal("postId", postId), Query.orderDesc("$createdAt")],
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
