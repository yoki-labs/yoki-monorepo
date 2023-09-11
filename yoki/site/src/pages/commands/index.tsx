import { Typography } from "@mui/joy";
import type { NextPage } from "next";
import LandingPage from "../../components/landing/LandingPage";

export const getStaticProps = () => ({
    redirect: { destination: "/commands/general", permanent: false, },
});

const Commands: NextPage<{}> = ({}) => {
    return (
        <LandingPage>
            <Typography>Redirecting</Typography>
        </LandingPage>
    );
};

export default Commands;
