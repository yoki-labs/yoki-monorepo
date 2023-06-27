import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";

export default function LabsOverflowButton() {
    return (
        <IconButton aria-label="Overflow icon">
            <FontAwesomeIcon icon={faEllipsisV} />
        </IconButton>
    );
}
