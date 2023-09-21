import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Stack, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    icon: IconDefinition;
    name: string;
    children: ReactNode | ReactNode[];
};

export default function InfoText({ icon, name, children }: Props) {
    return (
        <Stack gap={1} direction="row" alignItems="center">
            <FontAwesomeIcon icon={icon} />
            <Typography textColor="text.primary" fontWeight="bolder">
                {name}:
            </Typography>
            <Typography textColor="text.secondary">{children}</Typography>
        </Stack>
    );
}
