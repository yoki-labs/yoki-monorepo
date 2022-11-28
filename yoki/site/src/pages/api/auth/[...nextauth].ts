import NextAuth, { NextAuthOptions } from "next-auth";
import GuildedProvider from "next-auth-guilded";

export const authOptions: NextAuthOptions = {
	// Configure one or more authentication providers
	providers: [
		GuildedProvider({
			clientId: "7af0dd87-f6c8-43b1-b1bb-8917c82d5cfd",
			clientSecret: "i1LJofekNEMn3agyY7mpAbACykPhdBXh",
			authorization: {
				params: { scope: "identify servers" },
			},
		}),
		// ...add more providers here
	],
	callbacks: {
		async session({ session, token }) {
			// by default, next-auth does not include the user ID as part of the session object. Crazy, I know
			// this is a glue fix that takes the ID from the token payload (under .sub) and assigns it to the session object
			if (session?.user) {
				session.user.id = token.sub;
				session.user.avatar = token.avatar;
				session.user.access_token = token.access_token;
			}
			return session;
		},
		async jwt(data) {
			if (data.user && data.account) {
				data.user.access_token = data.account.access_token;
				data.token.avatar = data.user.avatar;
				data.token.access_token = data.account.access_token;
			}
			return data.token;
		},
	}
};
export default NextAuth(authOptions);
