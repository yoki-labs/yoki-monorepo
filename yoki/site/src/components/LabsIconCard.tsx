import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Box, Card, CardContent, CardOverflow, styled } from "@mui/joy";

export type Props = {
    icon: IconDefinition;
    children: React.ReactNode | React.ReactNode[];

    iconClassName?: string;
    // iconAspectRatio?: number;
    iconSize?: number | string;
    orientation?: "horizontal" | "vertical";
    useFontColor?: boolean;
};

export const IconCardIconWrapper = styled(`aside`)(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.level2,
}));

export default function LabsIconCard(props: Props) {
    const { children, icon, iconClassName, orientation, iconSize, useFontColor } = props;

    return (
        <Card orientation={orientation ?? "horizontal"} variant="plain" sx={{ overflow: "hidden" }}>
            <CardOverflow sx={{ padding: "0" }}>
                {/* <AspectRatio ratio={iconAspectRatio ?? 0.6} sx={{ width: iconWidth }}>
                </AspectRatio> */}
                <Box sx={{ display: "flex", width: orientation === "vertical" ? "100%" : iconSize, height: orientation !== "vertical" ? "100%" : iconSize }}>
                    <IconCardIconWrapper
                        sx={(theme) => ({ background: theme.vars.palette.background.level2, color: useFontColor ? theme.vars.palette.text.primary : "white" })}
                        className={`flex grow w-full h-full items-center col-span-1 transition-all ease-in duration-300 bg-gradient-to-br from-0% via-50% to-100% ${
                            iconClassName ?? ""
                        }`}
                    >
                        <div className="flex grow flex-col items-center">
                            <FontAwesomeIcon className={`margin-auto w-9 h-9`} icon={icon} />
                        </div>
                    </IconCardIconWrapper>
                </Box>
            </CardOverflow>
            <CardContent className="flex flex-col">{children}</CardContent>
        </Card>
    );
}
