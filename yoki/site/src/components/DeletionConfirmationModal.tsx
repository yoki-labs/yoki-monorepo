import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { LabsModal } from "./LabsModal";
import { Box, Button, Stack, Typography } from "@mui/joy";

type Props = {
    itemType: string;
    onConfirm: () => unknown;
    onClose: () => unknown;
};

export function DeletionConfirmationModal({ itemType, onConfirm, onClose }: Props) {
    return (
        <LabsModal
            icon={faTriangleExclamation}
            title={`Delete ${itemType}?`}
            onClose={onClose}
        >
            <Box>
                <Typography level="body2">Are you sure you want to delete the {itemType}?</Typography>
            </Box>
            <Stack mt={2} direction="row-reverse" gap={2}>
                <Button onClick={onConfirm} variant="solid" color="danger">
                    Delete
                </Button>
                <Button onClick={onClose} variant="soft" color="neutral">
                    Cancel
                </Button>
            </Stack>
        </LabsModal>
    )
}