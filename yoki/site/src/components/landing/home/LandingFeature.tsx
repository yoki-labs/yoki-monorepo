import { faCheck, faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, ListItem, ListItemDecorator, Stack, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    children: ReactNode | ReactNode[];
    opacity?: number;
};

export default function LandingFeature({ opacity, children }: Props) {
    return (
        <ListItem color="primary" sx={{ opacity, "--ListItemDecorator-size": "2rem", "--ListItem-minHeight": "2rem" }}>
            <ListItemDecorator>
                <Alert color="success" variant="soft" sx={{ width: 16, height: 16, p: 0.5, borderRadius: "100%" }}>
                    <Stack direction="column" alignItems="center" sx={{ width: "100%" }}>
                        <FontAwesomeIcon icon={faCheck} className="h-4" />
                    </Stack>
                </Alert>
            </ListItemDecorator>
            <Typography textColor="text.primary">{children}</Typography>
        </ListItem>
    );
}
