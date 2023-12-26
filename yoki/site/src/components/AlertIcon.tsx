import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, ColorPaletteProp, VariantProp } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

type Props = {
    icon: IconDefinition;

    color?: ColorPaletteProp;
    variant?: VariantProp;
    size?: number;

    iconStyle?: React.CSSProperties;
    sx?: SxProps | undefined;
};

export default function AlertIcon({ icon, color, variant, sx, iconStyle, size: sizeProp }: Props) {
    const size = sizeProp ?? 16;

    return (
        <Alert color={color} variant={variant} sx={{ width: size, height: size, borderRadius: "100%", p: 0.75, ...sx }}>
            <FontAwesomeIcon icon={icon} style={{ width: size, height: size, ...iconStyle }} />
        </Alert>
    );
}
