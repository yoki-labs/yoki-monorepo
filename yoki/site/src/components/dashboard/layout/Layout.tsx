// import { faCamera, faCog, faDoorClosed, faGavel, faImage, faPray, faRoadSpikes, faVoteYea } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";

import { GuildedServer } from "../../../lib/@types/guilded/Server";
// import { navbarAtom } from "../../state/navbar";
import { tempToastAtom } from "../../../state/toast";
import { LayoutSidebar } from "./LayoutSidebar";
import { Box, CssBaseline, Option, FormControl, MenuItem, Select, Breadcrumbs, Typography } from "@mui/joy";
import React from "react";
import { ServerSelector } from "./ServerSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronCircleRight, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import YokiIcon from "../../YokiIcon";

type LayoutProps = {
    servers: GuildedServer[];
    children: React.ReactNode;
};

export default class Layout extends React.Component<LayoutProps> {
    constructor(props: LayoutProps) {
        super(props);
    }

    render() {
        const { children, servers } = this.props;

        return (
            <>
                <div className="flex flex-col h-full w-full bg-spacedark-950">
                    <Box sx={{ display: "flex", flexDirection: "row", p: 3 }}>
                        <Breadcrumbs sx={{ p: 0, "--Breadcrumbs-gap": "20px" }} separator={<Typography level="h6" textColor="text.secondary">/</Typography>}>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Typography startDecorator={<YokiIcon className="fill-spacelight-600" width="32px" height="32px" />} level="h6" textColor="text.secondary" component="div">
                                    Yoki
                                </Typography>
                            </Box>
                            <ServerSelector servers={servers}/>
                        </Breadcrumbs>
                    </Box>
                    <main className="flex flex-row">
                        <LayoutSidebar />
                        <div className="flex flex-col md:ml-3 md:my-4">
                            <label htmlFor="my-drawer-2" className="btn bg-primary text-black drawer-button lg:hidden">
                                Open sidebar
                            </label>
                            <div className="h-fit">{children}</div>
                        </div>
                    </main>
                </div>
            </>
        );
    }
}

// export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
//     // const [currentModule, setModule] = useAtom(navbarAtom);
//     const toast = useAtomValue(tempToastAtom);

// }
