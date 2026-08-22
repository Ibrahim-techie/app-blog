import { Client } from "appwrite";
import config from "../Config/Config";

const client = new Client();

client.setEndpoint(config.endPoint).setProject(config.appwriteProjectId);

export default client;

//Client instance Configuratiuon
