import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItem, ListItemDecorator, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    children: ReactNode | ReactNode[];
    opacity?: number;
};

export default function LandingFeature({ opacity, children }: Props) {
    return (
        <ListItem color="primary" sx={{ opacity, "--ListItemDecorator-size": "1.5rem", "--ListItem-minHeight": "2rem" }}>
            <ListItemDecorator>
                <FontAwesomeIcon icon={faCheckSquare} />
            </ListItemDecorator>
            <Typography textColor="text.primary">{children}</Typography>
        </ListItem>
    );
}
