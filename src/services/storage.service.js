import config from "../Config/Config";
import { ID, Storage, Permission, Role } from "appwrite";
import client from "./client";

class fileService {
  storage;

  constructor() {
    this.storage = new Storage(client);
  }

  async fileUpload(file) {
    try {
      const result = await this.storage.createFile({
        bucketId: config.bucketId,
        fileId: ID.unique(),
        file: file,
        permissions: [Permission.read(Role.any())],
      });

      return result;
    } catch (error) {
      console.log(
        "Error occured while uploading file :: fileUpload:storage.service.js",
        error,
      );

      return false;
    }
  }

  async fileDelete(fileID) {
    try {
      await this.storage.deleteFile({
        bucketId: config.bucketId,
        fileId: fileID,
      });

      return true;
    } catch (error) {
      console.log(
        "Error occured while deleting a file :: fileDelete::storage.service.js",
        error,
      );

      return false;
    }
  }

  filePreview(fileID) {
    try {
      const result = this.storage.getFileView({
        bucketId: config.bucketId,
        fileId: fileID,
      });
      // console.log("Preview Request has been made ");

      return result;
    } catch (error) {
      console.log(
        "Error occured while previewing a file :: filePreview:storage.service.js",
        error,
      );

      return false;
    }
  }
}

const fileservice = new fileService();

export default fileservice;
