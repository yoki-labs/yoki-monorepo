// import { faCamera, faCog, faDoorClosed, faGavel, faImage, faPray, faRoadSpikes, faVoteYea } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";

import { GuildedServer } from "../../../lib/@types/guilded/Server";
// import { navbarAtom } from "../../state/navbar";
import { LayoutSidebar } from "./LayoutSidebar";
import { Box } from "@mui/joy";
import React from "react";
import { LayoutTopbar } from "./LayoutTopbar";

type LayoutProps = {
    servers: GuildedServer[];
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
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
        const { children, servers, user } = this.props;

        return (
            <>
                <div className="flex flex-col h-full w-full bg-spacedark-950">
                    <LayoutTopbar servers={servers} user={user} onMenuToggle={this.toggleMenu.bind(this)} />
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
