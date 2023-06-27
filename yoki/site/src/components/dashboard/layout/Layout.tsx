// import { faCamera, faCog, faDoorClosed, faGavel, faImage, faPray, faRoadSpikes, faVoteYea } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";

import { GuildedServer } from "../../../lib/@types/guilded/Server";
// import { navbarAtom } from "../../state/navbar";
import { tempToastAtom } from "../../../state/toast";
import { LayoutSidebar } from "./LayoutSidebar";
import { AppBar, Box, CssBaseline, Toolbar } from "@mui/material";
import React from "react";

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
                <div className="flex flex-row drawer drawer-mobile bg-spacedark-950">
                    <LayoutSidebar servers={servers} />
                    <div className="drawer-content flex flex-col md:ml-3 md:my-4">
                        <label htmlFor="my-drawer-2" className="btn bg-primary text-black drawer-button lg:hidden">
                            Open sidebar
                        </label>
                        <div className="h-fit">{children}</div>
                    </div>
                </div>
                {/* {toast && (
                    <div className="fixed flex items-center w-1/4 max-w-xs p-4 space-x-4 bg-primary text-black rounded-lg shadow top-2 right-5 z-50" role="alert">
                        <div className="text-md font-normal">{toast}</div>
                    </div>
                )} */}
            </>
        );
    }
}

// export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
//     // const [currentModule, setModule] = useAtom(navbarAtom);
//     const toast = useAtomValue(tempToastAtom);

// }
