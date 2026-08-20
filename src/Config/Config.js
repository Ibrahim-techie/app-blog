const config = {
  appwriteUrl: import.meta.env.VITE_APPWRITE_URL,
  appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  tableId: import.meta.env.VITE_APPWRITE_TABLE_ID,
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  endPoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  TinyMCE:import.meta.env.VITE_TINYMCE_API_KEY
};

export default config;

//environemnt variable configuratrion
