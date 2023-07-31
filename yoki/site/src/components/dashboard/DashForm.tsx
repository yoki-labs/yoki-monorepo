import { atom, useAtomValue } from "jotai";

import Config from "./overview/Premium";
import History from "./automod/History";
import Overview from "./overview/Overview";
import { Alert, Box, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Automod from "./automod/Automod";
import { navbarAtom } from "../../state/navbar";
import { SanitizedServer } from "../../lib/@types/db";
import Modmail from "./entry/Modmail";
import Antiraid from "./entry/Antiraid";
import { dashboardPageList } from "./pages";

type Props = {
    page: string;
    serverConfig: SanitizedServer;
};

export default function DashForm(props: Props) {
    const currentPage = useAtomValue(navbarAtom);
    const pageInfo = dashboardPageList.find((x) => x.id === currentPage);
    const PageComponent = pageInfo?.component;

    return (
        <Box sx={{ pt: 1, pb: 6, pl: 5.6, pr: 5.6 }} className="w-full h-full overflow-y-auto flex flex-col space-y-8 scrollbar">
            {/* <div>
                <Typography level="h3">{currentPage[0].toUpperCase() + currentPage.substring(1)}</Typography>
            </div> */}

            {PageComponent ? <PageComponent serverConfig={props.serverConfig} /> : (
                <Alert startDecorator={<FontAwesomeIcon icon={faExclamationTriangle} />} variant="solid" color="warning">
                    Work in progress. Come back later!
                </Alert>
            )}
        </Box>
    );
}
