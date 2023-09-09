import { IconDefinition, faCheckCircle, faInfoCircle, faTimes, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, Card, CardContent, ColorPaletteProp, IconButton, Stack } from "@mui/joy";
import { Toast, ToastType, toast } from "react-hot-toast";

type Props = {
    toast: Toast;
};

const infoByToastType: Record<ToastType, { icon: IconDefinition, color: ColorPaletteProp }> = {
    success: { icon: faCheckCircle, color: "success" },
    error: { icon: faTimesCircle, color: "danger" },
    blank: { icon: faInfoCircle, color: "primary" },
    custom: { icon: faInfoCircle, color: "neutral" },
    loading: { icon: faInfoCircle, color: "neutral" },
};

export default function LabsToast({ toast: currentToast }: Props) {
    const { icon, color } = infoByToastType[currentToast.type];

    return (
        <Alert color={color} variant="soft">
            <Stack direction="row" alignItems="center" gap={4}>
                <FontAwesomeIcon icon={icon} />
                <Box>
                    <>
                        {currentToast.message}
                    </>
                </Box>
                <IconButton color={color} onClick={() => toast.dismiss(currentToast.id)}>
                    <FontAwesomeIcon icon={faTimes} />
                </IconButton>
            </Stack>
        </Alert>
    )
}