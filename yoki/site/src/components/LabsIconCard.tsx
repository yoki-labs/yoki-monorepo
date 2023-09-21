import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { AspectRatio, Box, Card, CardContent, CardOverflow } from "@mui/joy";

export type Props = {
    icon: IconDefinition;
    children: React.ReactNode | React.ReactNode[];

    iconClassName?: string;
    // iconAspectRatio?: number;
    iconSize?: number | string;
    orientation?: "horizontal" | "vertical";
};

export default function LabsIconCard(props: Props) {
    const { children, icon, iconClassName, orientation, iconSize } = props;

    return (
        <Card orientation={orientation ?? "horizontal"} variant="plain" sx={{ overflow: "hidden" }}>
            <CardOverflow sx={{ padding: "0" }}>
                {/* <AspectRatio ratio={iconAspectRatio ?? 0.6} sx={{ width: iconWidth }}>
                </AspectRatio> */}
                <Box sx={{ display: "flex", width: orientation === "vertical" ? "100%" : iconSize, height: orientation !== "vertical" ? "100%" : iconSize }}>
                    <aside
                        className={`flex grow w-full h-full items-center col-span-1 transition-all ease-in duration-300 bg-gradient-to-br bg-spacedark-800 from-0% to-100% ${
                            iconClassName ?? ""
                        }`}
                    >
                        <div className="flex grow flex-col items-center">
                            <FontAwesomeIcon className={`margin-auto w-9 h-9 text-white`} icon={icon} />
                        </div>
                    </aside>
                </Box>
            </CardOverflow>
            <CardContent className="flex flex-col">{children}</CardContent>
        </Card>
    );
}
