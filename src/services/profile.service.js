import config from "../Config/Config";
import client from "./client";
import { TablesDB, Query, Permission, Role } from "appwrite";

// Account prefs can only be read by their owner, so the public side of a
// profile — name, bio, photo — is mirrored into the `profiles` table where
// every reader can see it. One row per user; the row id is the account id.
//
// Anyone may read a profile; only its owner may change or remove it. Create
// is granted at the table level, so it is not repeated on the row.
function profilePermissions(userId) {
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

// Appwrite only lets a client grant permissions to roles it holds itself. A
// row that grants update to user:<row id> was therefore written by that user
// — anything else is someone squatting on another person's id, and ignored.
const isGenuine = (row) =>
  row.$permissions?.includes(`update("user:${row.$id}")`);

// Appwrite caps the number of values in one equal() query.
const MAX_IDS_PER_QUERY = 100;

/** The public fields of an account, in the shape the table stores. */
export function publicProfile(user) {
  return {
    name: user.name || "Anonymous",
    bio: user.prefs?.bio || null,
    avatarId: user.prefs?.avatarId || null,
  };
}

class ProfileService {
  tablesDB;

  constructor() {
    this.tablesDB = new TablesDB(client);
  }

  /** userId → profile for every id that has a genuine profile row. */
  async getProfiles(userIds) {
    const ids = [...new Set(userIds.filter(Boolean))];
    const profiles = {};

    for (let i = 0; i < ids.length; i += MAX_IDS_PER_QUERY) {
      const chunk = ids.slice(i, i + MAX_IDS_PER_QUERY);
      try {
        const result = await this.tablesDB.listRows({
          databaseId: config.databaseId,
          tableId: config.profilestableId,
          queries: [Query.equal("$id", chunk), Query.limit(chunk.length)],
          total: false,
        });
        for (const row of result.rows) {
          if (isGenuine(row)) {
            profiles[row.$id] = {
              name: row.name,
              bio: row.bio,
              avatarId: row.avatarId,
            };
          }
        }
      } catch (error) {
        console.log(
          "Error occurred while loading profiles :: getProfiles :: profile.service.js",
          error,
        );
        throw error;
      }
    }

    return profiles;
  }

  /**
   * Create or update the signed-in user's own public profile from their
   * account. Returns the stored profile.
   */
  async saveOwnProfile(user) {
    try {
      const row = await this.tablesDB.upsertRow({
        databaseId: config.databaseId,
        tableId: config.profilestableId,
        rowId: user.$id,
        data: publicProfile(user),
        permissions: profilePermissions(user.$id),
      });
      return { name: row.name, bio: row.bio, avatarId: row.avatarId };
    } catch (error) {
      console.log(
        "Error occurred while saving a profile :: saveOwnProfile :: profile.service.js",
        error,
      );
      throw error;
    }
  }
}

const profileservice = new ProfileService();

export default profileservice;
