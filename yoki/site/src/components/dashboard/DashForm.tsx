import { Box } from "@mui/joy";
import { SanitizedServer } from "../../lib/@types/db";
import { DashboardPageItem } from "./pages";
import PagePlaceholder, { PagePlaceholderIcon } from "../PagePlaceholder";
import { RoleType } from "@prisma/client";
import { roleTypeLevels } from "../../utils/routes/permissions";
import { GuildedServer } from "../../lib/@types/guilded";
import { LabsSessionUser } from "../../utils/routes/pages";

type Props = {
    page: DashboardPageItem | undefined;
    serverConfig: SanitizedServer;
    currentUser: LabsSessionUser;
    currentServer: GuildedServer;
    highestRoleType: RoleType;
};

export default function DashForm({ serverConfig, currentServer, currentUser, page, highestRoleType }: Props) {
    // const currentPage = useAtomValue(navbarAtom);
    // const pageInfo = dashboardPageList.find((x) => x.id === page);
    const PageComponent = page?.component;

    const highestRoleLevel = roleTypeLevels[highestRoleType];
    const pageRoleLevel = page ? roleTypeLevels[page.requiredRole] : null;

    return (
        <Box sx={{ width: "100%", pt: 1, pb: 6, px: 5.6 }} className="px-4 md:px-8 lg:px-12 w-full overflow-y-auto flex flex-col space-y-8 scrollbar">
            {PageComponent ? (
                highestRoleLevel < pageRoleLevel! ? (
                    <Box sx={{ pt: 8 }}>
                        <PagePlaceholder icon={PagePlaceholderIcon.NoPermission} title="No permission to view this">
                            You do not have the required {page!.requiredRole.toLowerCase()} role to view this page.
                        </PagePlaceholder>
                    </Box>
                ) : (
                    <PageComponent currentUser={currentUser} currentServer={currentServer} serverConfig={serverConfig} highestRoleType={highestRoleType} />
                )
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
