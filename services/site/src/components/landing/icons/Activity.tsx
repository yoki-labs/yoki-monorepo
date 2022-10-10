import * as React from "react";

function Activity(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="1em" height="1em" viewBox="0 0 20 20" fill="none" {...props}>
            <path d="M18.333 10H15l-2.5 7.5-5-15L5 10H1.667" stroke="#fff" strokeOpacity={0.8} strokeWidth={1.667} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default React.memo(Activity);
