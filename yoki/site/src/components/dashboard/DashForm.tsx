import { useAtomValue } from "jotai";

import { navbarAtom } from "../../state/navbar";
import MainSettings from "./modules/MainSettings";
import Automod from "./modules/Automod";

const modules = {
    "Main Settings": <MainSettings />,
    Automod: <Automod />,
};

export default function DashForm() {
    const currentModule = useAtomValue(navbarAtom);

    return (
        <div className="bg-gray-900 py-8 px-6 flex flex-col space-y-8 h-fit scrollbar">
            <h1 className="text-3xl font-semibold">{currentModule}</h1>

            {modules[currentModule as keyof typeof modules] ?? <h1 className="text-2xl font-bold">Work in progress! Check back in later...</h1>}
        </div>
    );
}
