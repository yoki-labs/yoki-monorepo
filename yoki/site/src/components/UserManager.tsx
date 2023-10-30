import { faChevronDown, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Divider, ListItemDecorator, Menu, MenuItem, Stack, Typography, buttonClasses } from "@mui/joy";
import Link from "next/link";
import React from "react";
import { LabsSessionUser } from "../utils/pageUtil";
import { ClickAwayListener } from "@mui/base";

type Props = {
    user: LabsSessionUser;
    displayName?: boolean;
};

export default function UserManager({ user, displayName }: Props) {
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
                <Avatar src={user.avatar ?? void 0} alt="Your profile picture">
                    {user.name?.[0] ?? ""}
                </Avatar>
                {displayName && (
                    <Typography ml={2} component="span" level="body-md" fontWeight="bolder">
                        {user.name}
                    </Typography>
                )}
            </Button>
            <Menu
                id="user-manager-menu"
                anchorEl={userManagerRef.current}
                open={menuOpen}
                onClose={setMenuOpen.bind(null, false)}
                placement="bottom"
                sx={{ "--ListItemDecorator-size": "3.2rem" }}
            >
                <ClickAwayListener onClickAway={setMenuOpen.bind(null, false)}>
                    <>
                        <Link href="/profile/overview" style={{ textDecoration: "none" }}>
                            <MenuItem>
                                <ListItemDecorator>
                                    <Avatar src={user.avatar ?? void 0} alt="Your profile picture">
                                        {user.name?.[0] ?? ""}
                                    </Avatar>
                                </ListItemDecorator>
                                <Stack direction="column">
                                    <Typography level="title-md">{user.name}</Typography>
                                    <Typography level="body-md" textColor="text.tertiary">
                                        Click to view profile
                                    </Typography>
                                </Stack>
                            </MenuItem>
                        </Link>
                        <Divider />
                        <Link href="/auth/signout" style={{ textDecoration: "none" }}>
                            <MenuItem color="danger">
                                <ListItemDecorator>
                                    <FontAwesomeIcon icon={faRightFromBracket} />
                                </ListItemDecorator>
                                Sign out
                            </MenuItem>
                        </Link>
                    </>
                </ClickAwayListener>
            </Menu>
        </>
    );
}
