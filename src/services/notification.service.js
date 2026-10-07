import config from "../Config/Config";
import client from "./client";
import { TablesDB, Query, Realtime } from "appwrite";

// Notifications are written by the notify Appwrite Function
// (functions/notify), never by the browser. Each one is readable, updatable
// and deletable by its recipient only, so every query here returns the
// signed-in user's own and nobody else's.
class NotificationService {
  tablesDB;
  realtime;

  constructor() {
    this.tablesDB = new TablesDB(client);
    this.realtime = new Realtime(client);
  }

  // One page of a user's notifications, newest first.
  async getNotifications({ userId, lastId, limit = 10 }) {
    try {
      const queries = [
        Query.equal("recipientId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ];
      if (lastId) queries.push(Query.cursorAfter(lastId));

      return await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.notificationstableId,
        queries,
      });
    } catch (error) {
      console.log(
        "Error occurred while fetching notifications :: getNotifications :: notification.service.js",
        error,
      );
      throw error;
    }
  }

  // How many notifications the user hasn't read. Only the total is needed,
  // so a single row is asked for.
  async getUnreadCount(userId) {
    try {
      const { total } = await this.tablesDB.listRows({
        databaseId: config.databaseId,
        tableId: config.notificationstableId,
        queries: [
          Query.equal("recipientId", userId),
          Query.equal("read", false),
          Query.select(["$id"]),
          Query.limit(1),
        ],
      });
      return total;
    } catch (error) {
      console.log(
        "Error occurred while counting notifications :: getUnreadCount :: notification.service.js",
        error,
      );
      throw error;
    }
  }

  async markRead(notificationId) {
    try {
      return await this.tablesDB.updateRow({
        databaseId: config.databaseId,
        tableId: config.notificationstableId,
        rowId: notificationId,
        data: { read: true },
      });
    } catch (error) {
      console.log(
        "Error occurred while marking a notification read :: markRead :: notification.service.js",
        error,
      );
      throw error;
    }
  }

  // Clients can't bulk-update rows, so each unread one is updated on its
  // own, a hundred at a time until none are left.
  async markAllRead(userId) {
    try {
      for (;;) {
        const { rows } = await this.tablesDB.listRows({
          databaseId: config.databaseId,
          tableId: config.notificationstableId,
          queries: [
            Query.equal("recipientId", userId),
            Query.equal("read", false),
            Query.select(["$id"]),
            Query.limit(100),
          ],
        });
        if (rows.length === 0) return;
        await Promise.all(rows.map((row) => this.markRead(row.$id)));
      }
    } catch (error) {
      console.log(
        "Error occurred while marking notifications read :: markAllRead :: notification.service.js",
        error,
      );
      throw error;
    }
  }

  /**
   * Listen for notifications arriving, being read or being removed.
   *
   * Appwrite only sends a user events for rows they can read, so this
   * carries the signed-in user's notifications and no one else's.
   *
   * Resolves to the subscription — unsubscribe on unmount via
   * subscribeWithCleanup() in utils/realtime.js.
   */
  subscribeToNotifications(onChange) {
    const channel = `databases.${config.databaseId}.tables.${config.notificationstableId}.rows`;
    return this.realtime.subscribe(channel, onChange);
  }
}

const notificationservice = new NotificationService();

export default notificationservice;
