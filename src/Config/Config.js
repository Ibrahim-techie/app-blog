const config = {
  appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  tableId: import.meta.env.VITE_APPWRITE_TABLE_ID,
  commenttableId: import.meta.env.VITE_APPWRITE_COMMENT_TABLE_ID,
  liketableId: import.meta.env.VITE_APPWRITE_LIKES_TABLE_ID,
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  endPoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  TinyMCE: import.meta.env.VITE_TINYMCE_API_KEY,
};

// Which environment variable each field came from, so a missing one can be
// named rather than guessed at.
const SOURCE = {
  appwriteProjectId: "VITE_APPWRITE_PROJECT_ID",
  databaseId: "VITE_APPWRITE_DATABASE_ID",
  tableId: "VITE_APPWRITE_TABLE_ID",
  commenttableId: "VITE_APPWRITE_COMMENT_TABLE_ID",
  liketableId: "VITE_APPWRITE_LIKES_TABLE_ID",
  bucketId: "VITE_APPWRITE_BUCKET_ID",
  endPoint: "VITE_APPWRITE_ENDPOINT",
  TinyMCE: "VITE_TINYMCE_API_KEY",
};

export const missingConfig = Object.keys(SOURCE).filter((key) => !config[key]);

// Vite bakes these in at build time, so a variable missing from the *build*
// environment silently becomes undefined and only shows up later as a baffling
// backend error — Appwrite replies "Missing required parameter: tableId" and
// says nothing about which variable was absent. A build that works locally and
// fails when deployed is almost always this. Name the culprit once, loudly.
if (missingConfig.length) {
  console.error(
    `[config] Missing environment variable(s): ${missingConfig
      .map((key) => SOURCE[key])
      .join(", ")}\n` +
      "Set them in .env for local work, and in your host's environment " +
      "settings for deployments. On Vercel: Project → Settings → " +
      "Environment Variables, ticked for Production, Preview AND Development, " +
      "then redeploy — existing builds do not pick up new variables.",
  );
}

export default config;

//environemnt variable configuratrion
