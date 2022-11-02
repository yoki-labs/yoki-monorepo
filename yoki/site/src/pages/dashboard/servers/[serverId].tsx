import Sidebar from "../../../partials/Sidebar";
import Header from "../../../partials/Header";
import { useState } from "react";

export default function ServerPage() {
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    return <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-custom-gray">
            {/*  Site header */}
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main>
                <div className="px-4 sm:px-6 lg:px-8 py-12 w-full max-w-9xl mx-auto">

                </div>
            </main>
        </div>
    </div>
}