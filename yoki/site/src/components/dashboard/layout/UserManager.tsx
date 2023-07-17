import { faChevronDown, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, ListItemDecorator, Menu, MenuItem, buttonClasses } from "@mui/joy";
import React from "react";

type Props = {
    user: Partial<{
        name: string | null;
        avatar: string | null;
    }>;
};

export default function UserManager({ user }: Props) {
    const userManagerRef = React.useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <>
            <Button
                id="user-manager-button"
                ref={userManagerRef}
                aria-haspopup={true}
                aria-expanded={menuOpen || void 0}
                variant="plain"
                color="neutral"
                onClick={() => setMenuOpen(!menuOpen)}
                endDecorator={<FontAwesomeIcon width={"14px"} icon={faChevronDown} />}
                sx={{
                    [`& .${buttonClasses.endDecorator}`]: {
                        transition: "0.2s",
                        transform: menuOpen ? "rotate(-180deg)" : undefined,
                    },
                }}
            >
                <Avatar src={user?.avatar ?? void 0} alt="Your profile picture">
                    {user?.name?.[0] ?? ""}
                </Avatar>
            </Button>
            <Menu
                id="user-manager-menu"
                anchorEl={userManagerRef.current}
                open={menuOpen}
                onClose={setMenuOpen.bind(null, false)}
                placement="bottom"
            >
                <MenuItem onClick={() => console.log("Log out clicked")}>
                    <ListItemDecorator>
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </ListItemDecorator>
                    Log out
                </MenuItem>
            </Menu>
        </>
    );
}