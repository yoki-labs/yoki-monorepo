import type { NextPage } from "next";

import LandingPage from "../components/landing/LandingPage";
import { Stack } from "@mui/joy";
import PagePlaceholder, { PagePlaceholderIcon } from "../components/PagePlaceholder";

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
