import { useAtomValue } from "jotai";

import { navbarAtom } from "../../state/navbar";
import Config from "./pages/Config";
import History from "./pages/History";
import Home from "./pages/Home";

const pages = {
    home: <Home />,
    main: <Config />,
    history: <History />,
};

export default function DashForm() {
    const currentPage = useAtomValue(navbarAtom);

    return (
        <div className="py-8 px-6 flex flex-col space-y-8 h-fit scrollbar">
            <div>
                <h1 className="text-4xl font-semibold mb-4">{currentPage[0].toUpperCase() + currentPage.substring(1)}</h1>
            </div>

            {pages[currentPage as keyof typeof pages] ?? <h1 className="text-2xl font-bold">Work in progress! Check back in later...</h1>}
        </div>
    );
}
