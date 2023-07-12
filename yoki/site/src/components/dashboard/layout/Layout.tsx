// import { faCamera, faCog, faDoorClosed, faGavel, faImage, faPray, faRoadSpikes, faVoteYea } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";

import { GuildedServer } from "../../../lib/@types/guilded/Server";
// import { navbarAtom } from "../../state/navbar";
import { LayoutSidebar } from "./LayoutSidebar";
import { Box, Breadcrumbs, Typography, IconButton } from "@mui/joy";
import React from "react";
import { ServerSelector } from "./ServerSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import YokiIcon from "../../YokiIcon";

type LayoutProps = {
    servers: GuildedServer[];
    children: React.ReactNode;
};
type LayoutState = {
    menuEnabled: boolean;
};

export default class Layout extends React.Component<LayoutProps, LayoutState> {
    constructor(props: LayoutProps) {
        super(props);

        this.state = { menuEnabled: false };
    }

    toggleMenu() {
        const { menuEnabled } = this.state;
        this.setState({ menuEnabled: !menuEnabled });
    }

    render() {
        const { children, servers } = this.props;

        return (
            <>
                <div className="flex flex-col h-full w-full bg-spacedark-950">
                    <Box sx={{ display: "flex", flexDirection: "row", p: 3, gap: 2 }}>
                        <IconButton className="md:hidden block" onClick={this.toggleMenu.bind(this)} color="neutral">
                            <FontAwesomeIcon icon={faBars}/>
                        </IconButton>
                        <Breadcrumbs
                            sx={{ p: 0, "--Breadcrumbs-gap": "20px" }}
                            separator={
                                <Typography level="h6" textColor="text.secondary">
                                    /
                                </Typography>
                            }
                        >
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Typography
                                    startDecorator={<YokiIcon className="fill-spacelight-700" width="32px" height="32px" />}
                                    level="h6"
                                    textColor="text.secondary"
                                    component="div"
                                >
                                    Yoki
                                </Typography>
                            </Box>
                            <ServerSelector servers={servers} />
                        </Breadcrumbs>
                    </Box>
                    <Box className="flex flex-row overflow-hidden">
                        <LayoutSidebar menuToggled={this.state.menuEnabled} />
                        <Box className={`overflow-hidden grow basis-0 shrink-0 flex h-full ${this.state.menuEnabled ? "md:block hidden" : ""}`}>
                            {children}
                        </Box>
                    </Box>
                </div>
            </>
        );
    }
}

// export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
//     // const [currentModule, setModule] = useAtom(navbarAtom);
//     const toast = useAtomValue(tempToastAtom);

// }
