import type { NextPage } from "next";

import LandingPage from "../components/landing/LandingPage";
import { Stack } from "@mui/joy";
import PagePlaceholder, { PagePlaceholderIcon } from "../components/PagePlaceholder";

const Privacy: NextPage = () => {
    return (
        <LandingPage>
            <Stack direction="column" alignItems="center" sx={{ width: "100%", pt: 16 }}>
                <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later." />
            </Stack>
        </LandingPage>
    );
};

export default Privacy;
