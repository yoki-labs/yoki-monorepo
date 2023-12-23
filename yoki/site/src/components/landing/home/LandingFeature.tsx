import { faCheck, faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, ListItem, ListItemDecorator, Stack, Typography } from "@mui/joy";
import { ReactNode } from "react";
import AlertIcon from "../../AlertIcon";

type Props = {
    children: ReactNode | ReactNode[];
    opacity?: number;
};

export default function LandingFeature({ opacity, children }: Props) {
    return (
        <ListItem color="primary" sx={{ opacity, "--ListItemDecorator-size": "2.5rem", "--ListItem-minHeight": "2.5rem" }}>
            <ListItemDecorator>
                <AlertIcon icon={faCheck} color="success" variant="soft" />
            </ListItemDecorator>
            <Typography textColor="text.primary">{children}</Typography>
        </ListItem>
    );
}
