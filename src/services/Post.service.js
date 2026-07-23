import client from "./client";
import config from "../Config/Config";
import { TablesDB, Query } from "appwrite";

class Postservice {
  tablesDB;

  constructor() {
    this.tablesDB = new TablesDB(client);
  }

  async createPost({ title, slug, content, featuredImage, status, userID }) {
    try {
      const result = this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: slug,
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
          userId: userID,
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

  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      await this.tablesDB.updateRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: slug,
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
        },
      });
      return true;
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

  async getPosts() {
    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries: [Query.equal("status", ["active"])],
        total: true,
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

const postservice = new Postservice();

export default postservice;
