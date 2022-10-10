import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignIn() {
    useEffect(() => {
        void signIn("guilded", { callbackUrl: "/dashboard" });
    }, []);

    return <></>;
}
