import { useAtomValue } from "jotai";

import { navbarAtom } from "../../state/navbar";
import Config from "./pages/Config";
import History from "./pages/History";
import Overview from "./pages/Overview";
import { Alert, Box, Typography } from "@mui/joy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const pages = {
    overview: <Overview />,
    main: <Config />,
    history: <History />,
};

export default function DashForm() {
    const currentPage = useAtomValue(navbarAtom);

    return (
        <Box className="h-full py-8 px-6 overflow-y-auto flex flex-col space-y-8 h-fit scrollbar">
            <div>
                <Typography level="h3">{currentPage[0].toUpperCase() + currentPage.substring(1)}</Typography>
            </div>

            {pages[currentPage as keyof typeof pages] ?? (
                <Alert startDecorator={<FontAwesomeIcon icon={faExclamationTriangle} />} variant="solid" color="warning">
                    Work in progress. Come back later!
                </Alert>
            )}
        </Box>
    );
}
