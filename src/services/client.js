import { Client } from "appwrite";
import config from "../Config/config";

const client = new Client();

client.setEndpoint(config.endPoint).setProject(config.appwriteProjectId);

export default client;

//Client instance Configuratiuon
