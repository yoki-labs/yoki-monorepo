import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    icon: IconDefinition;
    subtitle: string;
    title: string;
    description: string;
    children: ReactNode | ReactNode[];
    rightSide?: boolean;
};

export default function FeaturePreview({ icon, subtitle, title, description, children, rightSide }: Props) {
    return (
        <Box component="article" className={`grid sm:grid-cols-1 md:grid-cols-[4fr,5fr] lg:grid-cols-[5fr,4fr] gap-10 md:gap-20 lg:gap-40`} sx={{ direction: rightSide ? "rtl" : "ltr" }}>
            <Box sx={{ direction: "ltr" }}>
                <Typography startDecorator={<FontAwesomeIcon icon={icon} />} level="body-md" textColor="text.tertiary" sx={{ mb: 2 }} fontWeight="bolder">
                    {subtitle}
                </Typography>
                <Typography level="h1" sx={{ mb: 2 }}>
                    {title}
                </Typography>
                <Typography level="body-md">{description}</Typography>
            </Box>
            <Box sx={{ direction: "ltr" }}>{children}</Box>
        </Box>
    );
}
