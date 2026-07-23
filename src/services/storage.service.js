import config from "../Config/Config";
import { ID, Storage } from "appwrite";
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
      const result = this.storage.getFilePreview({
        bucketId: config.bucketId,
        fileId: fileID,
        //   width: 0, // optional
        //   height: 0, // optional
        //   gravity: ImageGravity.Center, // optional
        //   quality: -1, // optional
        //   borderWidth: 0, // optional
        //   borderColor: "", // optional
        //   borderRadius: 0, // optional
        //   opacity: 0, // optional
        //   rotation: -360, // optional
        //   background: "", // optional
        //   output: ImageFormat.Jpg, // optional
        //   token: "<TOKEN>", // optional
      });

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
