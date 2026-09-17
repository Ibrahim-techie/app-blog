import client from "./client";
import config from "../Config/Config";
import { TablesDB, Query, ID, Permission, Role } from "appwrite";

// Who may do what with one post: any signed-in user can read an active post,
// only the author can read an inactive one, and only the author can edit or
// delete it. Appwrite enforces these once "Row security" is enabled on the table.
function postPermissions(userID, status) {
  return [
    Permission.read(status === "active" ? Role.users() : Role.user(userID)),
    Permission.update(Role.user(userID)),
    Permission.delete(Role.user(userID)),
  ];
}

class Postservice {
  tablesDB;

  constructor() {
    this.tablesDB = new TablesDB(client);
  }

  async createPost({ title, content, featuredImage, status, userID, author }) {
    try {
      // Appwrite generates the id, so two posts with the same title never
      // collide. The readable slug lives only in the URL (see utils/postUrl.js).
      return await this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: ID.unique(),
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
          userID: userID,
          author: author,
        },
        permissions: postPermissions(userID, status),
      });
    } catch (error) {
      console.log(
        "Error occured while database making::createPost::Post.service.js",
        error,
      );
      throw error;
    }
  }

  async updatePost(
    id,
    { title, content, featuredImage, status, author, userID },
  ) {
    try {
      return await this.tablesDB.updateRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: id,
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
          author: author,
        },
        // Status decides who can read the post, so refresh the permissions
        // whenever it might have changed.
        ...(userID && { permissions: postPermissions(userID, status) }),
      });
    } catch (error) {
      console.log(
        "Error occured while updating database::updatePost::Post.service.js",
        error,
      );
      throw error;
    }
  }

  async deletePost(id) {
    try {
      await this.tablesDB.deleteRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: id,
      });
    } catch (error) {
      console.log(
        "Error occured while deleting post from  database::deletePost::Post.service.js",
        error,
      );
      throw error;
    }
  }

  async getPost(id) {
    try {
      const result = await this.tablesDB.getRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: id,
      });
      return result;
    } catch (error) {
      console.log(
        "Error occured while getting post from  database::getPost::Post.service.js",
        error,
      );
      throw error;
    }
  }

  async getPosts(userID) {
    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        total: true,
        queries: [
          Query.equal("userID", userID),
          Query.limit(100),
          Query.orderDesc("$createdAt"),
        ],
      });

      return result;
    } catch (error) {
      console.log(
        "Error occured while getting posts from  database::getPosts::Post.service.js",
        error,
      );

      return false;
    }
  }

  // this is for f
  async getcursorRows({
    lastId = null,
    limit = 12,
    userID = null,
    status = "active",
  }) {
    const queries = [
      Query.limit(limit),
      Query.orderDesc("$createdAt"),
      Query.orderDesc("$id"),
      Query.select([
        "$id",
        "$createdAt",
        "title",
        "featuredImage",
        "status",
        "userID",
        "author",
      ]),
    ];

    // add status if only active and inactive provided
    if (status && status !== "all") {
      queries.push(Query.equal("status", status));
    }
    lastId ? queries.push(Query.cursorAfter(lastId)) : null;
    userID ? queries.push(Query.equal("userID", userID)) : null;

    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries,
        total: false,
      });
      return result;
    } catch (error) {
      console.log(
        "Error occured while getting posts from  database::getcursorRows::Post.service.js",
        error,
      );

      throw error;
    }
  }

  async searchRows({
    searchTerm,
    lastId = null,
    limit = 12,
    userID = null,
    status = "active",
  }) {
    const queries = [
      Query.search("title", searchTerm),
      Query.orderDesc("$createdAt"),
      Query.orderDesc("$id"),
      Query.limit(limit),
      Query.select([
        "$id",
        "$createdAt",
        "title",
        "featuredImage",
        "status",
        "userID",
        "author",
      ]),
    ];

    if (status && status !== "all") {
      queries.push(Query.equal("status", status));
    }
    if (userID) {
      queries.push(Query.equal("userID", userID));
    }
    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries,
        total: false,
      });

      return result;
    } catch (error) {
      console.log(
        "Error occurred while searching posts::searchRows::Post.service.js",
        error,
      );

      throw error;
    }
  }
}

// scroll pagination for All posts page initilally

const postservice = new Postservice();

export default postservice;
