import { useAtomValue } from "jotai";

import { navbarAtom } from "../../state/navbar";
import MainSettings from "./modules/MainSettings";

const modules = {
    "Main Settings": <MainSettings />,
};

export default function DashForm() {
    const currentModule = useAtomValue(navbarAtom);

    return (
        <div className="w-7/8 bg-gray-900 p-8 flex flex-col space-y-8">
            <h1 className="text-3xl font-semibold">{currentModule}</h1>

            {modules[currentModule as keyof typeof modules] ?? <h1 className="text-2xl font-bold">Work in progress! Check back in later...</h1>}
        </div>
    );
}
