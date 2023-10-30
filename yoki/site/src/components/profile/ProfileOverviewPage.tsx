import { Stack } from "@mui/joy";
import { ProfilePageProps } from "./pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../PagePlaceholder";

export default function ProfileOverviewPage({ user, appealCount }: ProfilePageProps) {
    return (
        <Stack direction="column" alignItems="center" sx={{ width: "100%", pt: 16 }}>
            <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress">
                This section has not been done yet. Come back later.
            </PagePlaceholder>
        </Stack>
    );
}