import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Menu } from "@mui/joy";
import React, { ReactElement } from "react";

type Props = {
    id: string;
    disabled?: boolean;
    children: ReactElement | ReactElement[];
    variant?: "outlined" | "plain" | "solid" | "soft";
};

export default function LabsOverflowButton({ id, variant, children, disabled }: Props) {
    const overflowRef = React.useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <>
            <IconButton
                id={`${id}-button`}
                ref={overflowRef}
                aria-haspopup={true}
                aria-expanded={menuOpen || void 0}
                disabled={disabled}
                color="neutral"
                variant={variant}
                aria-label="Overflow icon"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <FontAwesomeIcon icon={faEllipsisV} />
            </IconButton>
            <Menu
                id={`${id}-menu`}
                anchorEl={overflowRef.current}
                open={menuOpen}
                onClose={setMenuOpen.bind(null, false)}
                placement="bottom"
            >
                {children}
            </Menu>
        </>
    );
}
