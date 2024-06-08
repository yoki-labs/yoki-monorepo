import { Typography } from "@mui/joy";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import LandingPage from "../../components/landing/LandingPage";

const Commands: NextPage<{}> = ({}) => {
    const router = useRouter();

    useEffect(() => {
        void router.push("/commands/general");
    }, []);

    return (
        <LandingPage>
            <Typography>Redirecting</Typography>
        </LandingPage>
    );
};

export default Commands;
