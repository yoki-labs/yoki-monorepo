import React, { useState } from "react";

function SidebarLinkGroup({ children, activecondition }: { children: any; activecondition?: boolean }) {
    const [open, setOpen] = useState(activecondition);

    const handleClick = () => {
        setOpen(!open);
    };

    return <li className={`px-3 py-2 rounded-sm mb-0.5 last:mb-0 text-white ${activecondition && "bg-slate-900"}`}>{children(handleClick, open)}</li>;
}

export default SidebarLinkGroup;
