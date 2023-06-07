// import { faCamera, faCog, faDoorClosed, faGavel, faImage, faPray, faRoadSpikes, faVoteYea } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";

import { GuildedServer } from "../../../lib/@types/guilded/Server";
// import { navbarAtom } from "../../state/navbar";
import { tempToastAtom } from "../../../state/toast";
import { LayoutSidebar } from "./LayoutSidebar";

export default function Layout(props: { servers: GuildedServer[]; children: React.ReactNode }) {
    // const [currentModule, setModule] = useAtom(navbarAtom);
    const toast = useAtomValue(tempToastAtom);

    return (
        <>
            <div className="drawer drawer-mobile bg-spacedark-800">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col md:ml-3 md:my-4">
                    <label htmlFor="my-drawer-2" className="btn bg-primary text-black drawer-button lg:hidden">
                        Open sidebar
                    </label>
                    <div className="h-fit">{props.children}</div>
                </div>
                <LayoutSidebar servers={props.servers} />
            </div>
            {toast && (
                <div className="fixed flex items-center w-1/4 max-w-xs p-4 space-x-4 bg-primary text-black rounded-lg shadow top-2 right-5 z-50" role="alert">
                    <div className="text-md font-normal">{toast}</div>
                </div>
            )}
        </>
    );
}
