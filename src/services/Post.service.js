import client from "./client";
import config from "../Config/Config";
import { TablesDB, Query, ID, Permission, Role, Realtime } from "appwrite";

// Who may do what with one post: anyone at all can read a published post (the
// feed is public, no account needed), only the author can read their own draft,
// and only the author can edit or delete it. Appwrite enforces these once
// "Row security" is enabled on the table.
function postPermissions(userID, status) {
  return [
    Permission.read(status === "active" ? Role.any() : Role.user(userID)),
    Permission.update(Role.user(userID)),
    Permission.delete(Role.user(userID)),
  ];
}

// Everything a post card shows. The article body is the largest column and no
// list displays it, so lists select only these. A field missing here is
// silently missing from every card — add new card fields in this one place.
const CARD_FIELDS = [
  "$id",
  "$createdAt",
  "title",
  "featuredImage",
  "status",
  "userID",
  "author",
  "category",
];

// The category column is an enum, which rejects "" — "no category" is null.
const categoryValue = (category) => category || null;

class Postservice {
  tablesDB;
  realtime;

  constructor() {
    this.tablesDB = new TablesDB(client);
    this.realtime=new Realtime(client);
  }

  async createPost({
    title,
    content,
    featuredImage,
    status,
    userID,
    author,
    category,
  }) {
    try {
      // Appwrite generates the id, so two posts with the same title never
      // collide. The readable slug lives only in the URL (see utils/postUrl.js).
      return await this.tablesDB.createRow({
        databaseId: config.databaseId,
        tableId: config.tableId,
        rowId: ID.unique(), //26 characters long
        data: {
          title: title,
          content: content,
          featuredImage: featuredImage,
          status: status,
          userID: userID,
          author: author,
          category: categoryValue(category),
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
    { title, content, featuredImage, status, author, userID, category },
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
          // Left untouched when a caller doesn't mention it, so an update
          // that isn't about category can never wipe one.
          ...(category !== undefined && { category: categoryValue(category) }),
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

  /**
   * Several posts by id in a single request — used to turn a page of saved
   * post ids into cards without one round trip per post.
   *
   * Two things callers must know: the result is NOT in the order of `ids`, and
   * any id that no longer exists, or that the reader may not see (someone
   * else's draft), is simply absent rather than an error.
   */
  async getPostsByIds(ids) {
    if (!ids?.length) return [];

    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries: [
          Query.equal("$id", ids),
          Query.limit(ids.length),
          Query.select(CARD_FIELDS),
        ],
        total: false,
      });
      return result.rows;
    } catch (error) {
      console.log(
        "Error occured while getting posts by id::getPostsByIds::Post.service.js",
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

  /**
   * Ids of every published post by one user — for the profile stats, which
   * count likes and comments across all of them.
   *
   * Pages through `$id` only, so even a prolific author costs a few tiny
   * requests rather than one huge one.
   */
  async getPublishedPostIds(userID) {
    const PAGE = 100;
    const ids = [];
    let lastId = null;

    try {
      for (;;) {
        const queries = [
          Query.equal("userID", userID),
          Query.equal("status", "active"),
          Query.orderAsc("$id"),
          Query.limit(PAGE),
          Query.select(["$id"]),
        ];
        if (lastId) queries.push(Query.cursorAfter(lastId));

        const { rows } = await this.tablesDB.listRows({
          databaseId: config.databaseId,
          tableId: config.tableId,
          queries,
          total: false,
        });

        ids.push(...rows.map((row) => row.$id));
        if (rows.length < PAGE) return ids;
        lastId = rows[rows.length - 1].$id;
      }
    } catch (error) {
      console.log(
        "Error occured while getting post ids::getPublishedPostIds::Post.service.js",
        error,
      );
      throw error;
    }
  }

  // this is for f
  async getcursorRows({
    lastId = null,
    limit = 12,
    userID = null,
    status = "active",
    category = null,
    // "asc" lists oldest first. The cursor still works: cursorAfter follows
    // whichever order the query asks for.
    order = "desc",
  }) {
    const sort = order === "asc" ? Query.orderAsc : Query.orderDesc;
    const queries = [
      Query.limit(limit),
      sort("$createdAt"),
      sort("$id"),
      Query.select(CARD_FIELDS),
    ];

    // add status if only active and inactive provided
    if (status && status !== "all") {
      queries.push(Query.equal("status", status));
    }
    lastId ? queries.push(Query.cursorAfter(lastId)) : null;
    userID ? queries.push(Query.equal("userID", userID)) : null;
    category ? queries.push(Query.equal("category", category)) : null;

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
    category = null,
    order = "desc",
  }) {
    const sort = order === "asc" ? Query.orderAsc : Query.orderDesc;
    const queries = [
      Query.search("title", searchTerm),
      sort("$createdAt"),
      sort("$id"),
      Query.limit(limit),
      Query.select(CARD_FIELDS),
    ];

    if (category) {
      queries.push(Query.equal("category", category));
    }

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

  /**
   * The newest published posts, with their body — the Home featured cards
   * show an excerpt and a reading time, which need the text. Kept to a few
   * rows so loading `content` stays cheap.
   */
  async getFeaturedPosts(limit = 3) {
    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries: [
          Query.equal("status", "active"),
          Query.orderDesc("$createdAt"),
          Query.orderDesc("$id"),
          Query.limit(limit),
          Query.select([...CARD_FIELDS, "content"]),
        ],
        total: false,
      });
      return result.rows;
    } catch (error) {
      console.log(
        "Error occured while getting featured posts::getFeaturedPosts::Post.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * Up to `limit` other published posts for the "Related articles" column:
   * same category when the post has one, otherwise simply the newest.
   */
  async getRelatedPosts({ postId, category = null, limit = 3 }) {
    const queries = [
      Query.equal("status", "active"),
      Query.notEqual("$id", postId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
      Query.select(CARD_FIELDS),
    ];
    if (category) queries.push(Query.equal("category", category));

    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries,
        total: false,
      });
      return result.rows;
    } catch (error) {
      console.log(
        "Error occured while getting related posts::getRelatedPosts::Post.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * How many posts match, without downloading them: one row is requested and
   * Appwrite reports the total. Used for the published-articles statistic and
   * the per-category counts.
   */
  async getPostCount({ status = "active", category = null } = {}) {
    const queries = [Query.limit(1), Query.select(["$id"])];
    if (status) queries.push(Query.equal("status", status));
    if (category) queries.push(Query.equal("category", category));

    try {
      const result = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.tableId,
        queries,
        total: true,
      });
      return result.total ?? 0;
    } catch (error) {
      console.log(
        "Error occured while counting posts::getPostCount::Post.service.js",
        error,
      );
      throw error;
    }
  }

  subscribeToPosts(onChange) {
    const channel = `databases.${config.databaseId}.tables.${config.tableId}.rows`;
    return this.realtime.subscribe(channel, onChange);
  }
}

// scroll pagination for All posts page initilally

const postservice = new Postservice();

export default postservice;
