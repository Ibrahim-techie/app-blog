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

  // Both of these act on the signed-in session's own account — Appwrite has no
  // way to aim them at another user, so "only edit your own profile" is
  // enforced by the server, not by the UI.
  async updateName(name) {
    try {
      return await this.account.updateName({ name });
    } catch (error) {
      console.log("Error in updateName :: auth.service.js::error", error);
      throw error;
    }
  }

  // Prefs are replaced wholesale, so callers must pass the existing prefs
  // merged with their changes or every other key is lost.
  async updatePrefs(prefs) {
    try {
      return await this.account.updatePrefs({ prefs });
    } catch (error) {
      console.log("Error in updatePrefs :: auth.service.js::error", error);
      throw error;
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
