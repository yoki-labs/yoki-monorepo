import * as React from "react";

function CheckSquare(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 25 24" fill="none" {...props}>
            <path d="M9.5 11l3 3 10-10" stroke="#F5C400" strokeOpacity={0.8} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21.5 12v7a2 2 0 01-2 2h-14a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#F5C400" strokeOpacity={0.8} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default React.memo(CheckSquare);
