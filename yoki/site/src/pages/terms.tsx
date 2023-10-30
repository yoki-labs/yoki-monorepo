import type { GetServerSideProps, NextPage } from "next";

import LandingPage from "../components/landing/LandingPage";
import { Stack } from "@mui/joy";
import PagePlaceholder, { PagePlaceholderIcon } from "../components/PagePlaceholder";
import { LandingPageSessionProps, getLandingPagePageProps } from "../utils/pageUtil";

export const getServerSideProps: GetServerSideProps<LandingPageSessionProps> = getLandingPagePageProps;

const TOS: NextPage = () => {
    return (
        <LandingPage>
            <Stack direction="column" alignItems="center" sx={{ width: "100%", pt: 16 }}>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress">
                    This section has not been done yet. Come back later.
                </PagePlaceholder>
            </Stack>
        </LandingPage>
    );
};

export default TOS;
