import { IconDefinition, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Divider, IconButton, ModalDialog, Stack, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    icon: IconDefinition;
    title: string;
    onClose: () => unknown;
    children: ReactNode | ReactNode[];
};

export function LabsModal({ icon, title, onClose, children }: Props) {
    return (
        <ModalDialog
            role="menu"
            // aria-labelledby="modal-title"
            // aria-describedby="modal-title"
        >
            <Stack mb={2} gap={2} direction="row" alignItems="center">
                <FontAwesomeIcon icon={icon} />
                <Typography level="h2" fontSize="md" sx={{ flex: "1" }}>{ title }</Typography>
                <IconButton size="sm" variant="outlined" color="neutral" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </IconButton>
            </Stack>
            <Divider />
            <Box mt={2}>
                { children }
            </Box>
        </ModalDialog>
    );
}