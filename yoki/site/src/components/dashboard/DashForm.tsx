import { atom, useAtomValue } from "jotai";

import Config from "./pages/Config";
import History from "./pages/History";
import Overview from "./pages/Overview";
import { Alert, Box, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import Automod from "./pages/Automod";
import { navbarAtom } from "../../state/navbar";
import { SanitizedServer } from "../../lib/@types/db";

const pages = {
    overview: Overview,
    main: Config,
    automod: Automod,
    history: History,
};
type Props = {
    page: string;
    serverConfig: SanitizedServer;
};

export default function DashForm(props: Props) {
    const currentPage = useAtomValue(navbarAtom);
    const PageComponent = pages[currentPage as keyof typeof pages];

    return (
        <Box className="h-full py-8 px-6 overflow-y-auto flex flex-col space-y-8 h-fit scrollbar">
            <div>
                <Typography level="h3">{currentPage[0].toUpperCase() + currentPage.substring(1)}</Typography>
            </div>

            {PageComponent ? <PageComponent serverConfig={props.serverConfig} /> : (
                <Alert startDecorator={<FontAwesomeIcon icon={faExclamationTriangle} />} variant="solid" color="warning">
                    Work in progress. Come back later!
                </Alert>
            )}
        </Box>
    );
}
