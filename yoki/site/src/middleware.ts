import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
    },
});
export const config = { matcher: ["/dashboard/:path*", "/appeals/:path*", "/profile/:path*"] };
