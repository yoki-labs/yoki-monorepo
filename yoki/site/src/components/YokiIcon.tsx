import { SVGAttributes } from "react";

type Props = SVGAttributes<SVGSVGElement>;

export default function YokiIcon(props: Props) {
    return (
        <svg data-notice="SVG's ownership held by IdkGoodName/PrettyGoodName. Please ask before using this. Possible ways of contacting: https://guilded.gg/u/IdkGoodName, https://twitter.com/IdkGoodNameV1" xmlns="http://www.w3.org/2000/svg" {...props} viewBox="0 0 512 512">
            <defs>
                {/* <filter id="Yoki-Big-Shadow">
                    <feDropShadow dx="6" dy="8" flood-opacity="0.7" flood-color="black"
                        stdDeviation="14"></feDropShadow>
                </filter> */}
                <mask id="Yoki-Face-Mask">
                    <ellipse id="Yoki-Face-Mask-Allowed" cx="256" cy="256" rx="230" ry="220" fill="white" />
                </mask>
                <mask id="Yoki-Face-Glass-Cutout-Mask">
                    <ellipse id="Yoki-Glass-Cutout-Mask-Allowed" cx="256" cy="256" rx="200" ry="280"
                        fill="white" />
                </mask>
                <mask id="Yoki-Head-Mask">
                    <g id="Yoki-Head-Antenna">
                        <path id="Yoki-Head-Antenna-Stem" fill="none" stroke="white" stroke-width="16"
                            stroke-linecap="round"
                            d="M 256.00,80.00
                            C 256.00,-32.00 464.00,0.00 464.00,112.00" />
                        <circle id="Yoki-Head-Antenna-Fruit" fill="white" r="32" cx="464" cy="112" />
                    </g>
                    <ellipse id="Yoki-Head-Base" cx="256" cy="256" rx="220" ry="210" fill="white" />
                    <g id="Yoki-Faceplate">
                        <rect id="Yoki-Faceplate-Sides"
                            x="16" y="172" width="480" height="168" rx="40"
                            fill="white"></rect>
                        <ellipse id="Yoki-Faceplate-Top" rx="320" ry="160"
                            mask="url(#Yoki-Face-Mask)" fill="white"
                            cy="272" cx="256" />
                    </g>
                    <g id="Yoki-Face" mask="url(#Yoki-Face-Mask)">
                        <ellipse id="Yoki-Face-Glass" mask="url(#Yoki-Face-Glass-Cutout-Mask)" rx="300"
                            ry="130"
                            fill="#18121e" cy="272" cx="256" />
                        <g id="Yoki-Face-Expression" fill="white">
                            <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="160"
                                height="16"
                                y="336"
                                x="176"></rect>
                            <g className="Yoki-Face-Expression-Eyes">
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="208"
                                    x="144"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="224"
                                    x="128"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="240"
                                    x="112"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="256"
                                    x="96"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="224"
                                    x="160"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="240"
                                    x="176"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Left" width="16"
                                    height="16"
                                    y="256"
                                    x="192"></rect>
                            </g>
                            <g className="Yoki-Face-Expression-Eyes">
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="208"
                                    x="368"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="224"
                                    x="384"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="240"
                                    x="400"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="256"
                                    x="416"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="224"
                                    x="352"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="240"
                                    x="336"></rect>
                                <rect className="Yoki-Expression-Eyes Yoki-Expression-Eyes-Right" width="16"
                                    height="16"
                                    y="256"
                                    x="320"></rect>
                            </g>
                        </g>
                    </g>
                </mask>
            </defs>
            <rect
                width="512" height="512" mask="url(#Yoki-Head-Mask)"></rect>
        </svg>
    );
}