import { Box } from "@mui/joy";
import { profilePageList } from "./pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../PagePlaceholder";
import { LabsSessionUser } from "../../utils/pageUtil";

type Props = {
    page: string;
    user: LabsSessionUser;
    totalAppealCount: number;
    awaitingAppealCount: number;
};

export default function ProfileForm({ user, page, totalAppealCount, awaitingAppealCount }: Props) {
    // const currentPage = useAtomValue(navbarAtom);
    const pageInfo = profilePageList.find((x) => x.id === page);
    const PageComponent = pageInfo?.component;

    return (
        <Box sx={{ width: "100%", pt: 1, pb: 6, px: 5.6 }} className="grow px-4 md:px-12 w-full overflow-y-auto flex flex-col space-y-8 scrollbar">
            {PageComponent ? (
                <PageComponent user={user} appealCount={totalAppealCount} />
            ) : (
                <Box sx={{ pt: 8 }}>
                    <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title="Page not found">
                        This profile page does not seem to exist.
                    </PagePlaceholder>
                </Box>
            )}
        </Box>
    );
}
