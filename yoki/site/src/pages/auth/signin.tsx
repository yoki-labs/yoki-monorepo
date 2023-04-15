import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function SignIn() {
    const router = useRouter();
    useEffect(() => {
        void signIn("guilded", { callbackUrl: (router.query.callbackUrl as string) ?? undefined });
    }, [router.query]);

    return <></>;
}
