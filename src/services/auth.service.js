import { Account, ID, OAuthProvider } from "appwrite";

import client from "./client";
class AuthService {
  account;

  constructor() {
    this.account = new Account(client);
  }

  async createAccount({ email, password, name }) {
    try {
      await this.account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });

      return await this.logIn({ email: email, password: password });
    } catch (error) {
      console.error(
        "Account creation failed::createAccount::auth.service.js::error",
        error,
      );
      throw error;
    }
  }

  async logIn({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession({
        email,
        password,
      });
    } catch (error) {
      console.log("No Account found::logIn::auth.service.js::error", error);
      throw error;
    }
  }

  //oAuth2 session with google

  signInwithGoogle() {
    return this.account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: `${window.location.origin}/`,
      failure: `${window.location.origin}/login`,
      scopes: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch {
      return null; // explicitly signal "no user"
    }
  }

  async logOut() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      console.log("Error in logOut :: auth.service.js::error", error);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;
