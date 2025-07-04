import { Box } from "@mui/joy";
import { profilePageList } from "./pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../PagePlaceholder";
import { LabsProfiledUser } from "../../utils/routes/pages";

type Props = {
    page: string;
    user: LabsProfiledUser;
};

export default function ProfileForm({ user, page }: Props) {
    // const currentPage = useAtomValue(navbarAtom);
    const pageInfo = profilePageList.find((x) => x.id === page);
    const PageComponent = pageInfo?.component;

    return (
        <Box className="grow px-4 md:px-12 overflow-y-auto flex flex-col space-y-8 scrollbar">
            {PageComponent ? (
                <PageComponent user={user} />
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
