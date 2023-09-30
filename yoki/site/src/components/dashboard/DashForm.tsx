import { Box } from "@mui/joy";
import { SanitizedServer } from "../../lib/@types/db";
import { dashboardPageList } from "./pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../PagePlaceholder";

type Props = {
    page: string;
    serverConfig: SanitizedServer;
};

export default function DashForm({ serverConfig, page }: Props) {
    // const currentPage = useAtomValue(navbarAtom);
    const pageInfo = dashboardPageList.find((x) => x.id === page);
    const PageComponent = pageInfo?.component;

    return (
        <Box sx={{ width: "100%", pt: 1, pb: 6, px: 5.6 }} className="px-4 md:px-12 w-full overflow-y-auto flex flex-col space-y-8 scrollbar">
            {PageComponent ? (
                <PageComponent serverConfig={serverConfig} />
            ) : (
                <Box sx={{ pt: 8 }}>
                    <PagePlaceholder icon={PagePlaceholderIcon.NotFound} title="Page not found">
                        This dashboard page does not seem to exist.
                    </PagePlaceholder>
                </Box>
            )}
        </Box>
    );
}
