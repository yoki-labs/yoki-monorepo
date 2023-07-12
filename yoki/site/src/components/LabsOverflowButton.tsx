import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/joy";

type Props = {
    disabled?: boolean;
};

export default function LabsOverflowButton({ disabled }: Props) {
    return (
        <IconButton disabled={disabled} color="neutral" variant="outlined" aria-label="Overflow icon">
            <FontAwesomeIcon icon={faEllipsisV} />
        </IconButton>
    );
}
