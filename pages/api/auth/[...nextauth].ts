import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { GenericObject } from "next-auth/_utils";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      scope: "public_repo",
    }),
  ],
  callbacks: {
    async jwt(token, _user, account, _profile, _isNewUser) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
    async session(session, token) {
      session.accessToken = (token as GenericObject).accessToken;
      return session;
    },
  },
});
