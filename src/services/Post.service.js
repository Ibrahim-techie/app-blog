import client from "./client";
import config from "../Config/Config";
import { TablesDB, Query } from "appwrite";

class Postservice {
  tablesDB;

  constructor() {
    this.tablesDB = new TablesDB(client);
  }

  async createPost({
    title,
    slug,
    content,
    featuredImage,
    status,
    userID,
    author,
  }) {
    try {
      const result = this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: slug.slice(0, 36),
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
          userID: userID,
          author: author,
        },
      });

      return result;
    } catch (error) {
      console.log(
        "Error occured while database making::createPost::Post.service.js",
        error,
      );
      throw error;
    }
  }

  async updatePost(slug, { title, content, featuredImage, status, author }) {
    try {
      const result = await this.tablesDB.updateRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: slug,
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
          author: author,
        },
      });
      return result;
    } catch (error) {
      console.log(
        "Error occured while updating database::updatePost::Post.service.js",
        error,
      );
      return false;
    }
  }

  async deletePost(slug) {
    try {
      await this.tablesDB.deleteRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: slug,
      });
      return true;
    } catch (error) {
      console.log(
        "Error occured while deleting post from  database::deletePost::Post.service.js",
        error,
      );

      return false;
    }
  }

  async getPost(slug) {
    try {
      const result = await this.tablesDB.getRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: slug,
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
   
    Query.orderDesc("$createdAt")
  ]
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

  async getcursoRows({ lastId=null, limit = 12 }) {
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
      Query.equal("status", "active")
    ];

lastId?queries.push(Query.cursorAfter(lastId)):null;

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
        "Error occured while getting posts from  database::getPosts::Post.service.js",
        error,
      );

      return false;
    }
  }
}

// scroll pagination for All posts page initilally

const postservice = new Postservice();

export default postservice;
