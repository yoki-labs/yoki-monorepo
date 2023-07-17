import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { AspectRatio, Card, CardContent, CardOverflow } from "@mui/joy";

export type Props = {
    icon: IconDefinition;
    children: React.ReactNode | React.ReactNode[];

    iconClassName?: string;
    iconAspectRatio?: number;
};

export default function LabsIconCard(props: Props) {
    const { children, icon, iconAspectRatio, iconClassName } = props;

    return (
        <Card orientation="horizontal" variant="plain">
            <CardOverflow>
                <AspectRatio ratio={iconAspectRatio ?? 0.5} sx={{ width: 80 }}>
                    <aside className={`flex items-center col-span-1 transition-all ease-in duration-300 bg-gradient-to-br bg-spacedark-800 ${iconClassName ?? ""}`}>
                        <div className="flex grow flex-col items-center items-center">
                            <FontAwesomeIcon className={`margin-auto w-9 h-9 text-white`} icon={icon} />
                        </div>
                    </aside>
                </AspectRatio>
            </CardOverflow>
            <CardContent className="flex flex-col">
                { children }
            </CardContent>
        </Card>
    );
}
