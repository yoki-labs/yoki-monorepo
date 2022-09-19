import * as React from "react";

function Users(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
            <path
                d="M14.167 17.5v-1.667a3.333 3.333 0 00-3.334-3.333H4.167a3.333 3.333 0 00-3.334 3.333V17.5M7.5 9.167a3.333 3.333 0 100-6.667 3.333 3.333 0 000 6.667zM19.167 17.5v-1.667a3.334 3.334 0 00-2.5-3.225M13.333 2.608a3.334 3.334 0 010 6.459"
                stroke="#fff"
                strokeOpacity={0.8}
                strokeWidth={1.667}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default React.memo(Users);
