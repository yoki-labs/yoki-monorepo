import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SignOut() {
    useEffect(() => {
        void signOut({ callbackUrl: "/" });
    }, []);

    return <></>;
}
