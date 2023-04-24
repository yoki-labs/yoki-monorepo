import { useAtomValue } from "jotai";

import { navbarAtom } from "../../state/navbar";
import Config from "./pages/Config";
import History from "./pages/History";

const pages = {
    main: <Config />,
    history: <History />,
};

export default function DashForm() {
    const currentPage = useAtomValue(navbarAtom);

    return (
        <div className="py-8 px-6 flex flex-col space-y-8 h-fit scrollbar">
            <h1 className="text-3xl font-semibold">{currentPage}</h1>

            {pages[currentPage as keyof typeof pages] ?? <h1 className="text-2xl font-bold">Work in progress! Check back in later...</h1>}
        </div>
    );
}
