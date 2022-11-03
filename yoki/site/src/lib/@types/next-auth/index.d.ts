import "next-auth";

declare module "next-auth" {
    interface User {
        id: string | undefined;
        avatar: string | undefined;
        access_token: string | undefined;
    }

    interface Session {
        user: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        avatar: string | undefined;
        access_token: string | undefined;
    }
}
