import { faBolt, faChevronDown, faMoon, faPrayingHands, faRightFromBracket, faSun, faTablet, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Button, Divider, List, ListItemDecorator, Menu, MenuItem, Stack, Switch, Typography, buttonClasses, useColorScheme } from "@mui/joy";
import Link from "next/link";
import React from "react";
import { LabsSessionUser } from "../utils/routes/pages";
import { ClickAwayListener } from "@mui/base";
import { guildedAwsCdnDomain, guildedCdnDomain } from "../utils/userUtil";
import { LabsSwitch } from "./LabsSwitch";

type Props = {
    user?: LabsSessionUser | null;
    displayName?: boolean;
};

export default function UserManager({ user, displayName }: Props) {
    const userManagerRef = React.useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const { mode, setMode } = useColorScheme();

    const normalizedAvatar = user?.avatar?.replace(guildedAwsCdnDomain, guildedCdnDomain);

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
                {user && (
                    <Avatar src={normalizedAvatar ?? void 0} alt="Your profile picture">
                        {user.name?.[0] ?? ""}
                    </Avatar>
                )}
                {user && displayName && (
                    <Typography ml={2} component="span" level="body-md" fontWeight="bolder">
                        {user.name}
                    </Typography>
                )}
                {!user && <Avatar />}
            </Button>
            <Menu
                id="user-manager-menu"
                anchorEl={userManagerRef.current}
                open={menuOpen}
                onClose={setMenuOpen.bind(null, false)}
                placement="bottom"
                sx={{ "--ListItemDecorator-size": "2.8rem" }}
            >
                <ClickAwayListener onClickAway={setMenuOpen.bind(null, false)}>
                    <div>
                        {user ? (
                            <>
                                <Link href="/profile/overview" style={{ textDecoration: "none" }}>
                                    <MenuItem>
                                        <ListItemDecorator>
                                            <Avatar src={normalizedAvatar ?? void 0} alt="Your profile picture">
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
                            </>
                        ) : (
                            <Link href="/auth/signin?callbackUrl=%2F" style={{ textDecoration: "none" }}>
                                <MenuItem color="primary">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faUserCircle} />
                                    </ListItemDecorator>
                                    Sign in
                                </MenuItem>
                            </Link>
                        )}
                        <Divider />
                        <Link href="/premium" style={{ textDecoration: "none" }}>
                            <MenuItem color="warning">
                                <ListItemDecorator>
                                    <FontAwesomeIcon icon={faBolt} />
                                </ListItemDecorator>
                                Supercharge
                            </MenuItem>
                        </Link>
                        <Link href="/dashboard" style={{ textDecoration: "none" }}>
                            <MenuItem color="neutral">
                                <ListItemDecorator>
                                    <FontAwesomeIcon icon={faTablet} />
                                </ListItemDecorator>
                                Dashboard
                            </MenuItem>
                        </Link>
                        <Divider />
                        <MenuItem color="neutral" onClick={() => setMode(mode === "light" ? "dark" : "light")}>
                            <ListItemDecorator>
                                <FontAwesomeIcon icon={(mode ?? "dark") === "light" ? faSun : faMoon} />
                            </ListItemDecorator>
                            <Typography sx={{ color: "inherit" }}>Light theme</Typography>
                            <LabsSwitch
                                activeIcon={faSun}
                                deactivatedIcon={faMoon}
                                sx={{ ml: 4 }}
                                checked={(mode ?? "dark") === "light"}
                                onChange={() => setMode(mode === "light" ? "dark" : "light")}
                            />
                        </MenuItem>
                        {user && (
                            <>
                                <Divider />
                                <Link href="/auth/signout?callbackUrl=%2F" style={{ textDecoration: "none" }}>
                                    <MenuItem color="danger">
                                        <ListItemDecorator>
                                            <FontAwesomeIcon icon={faRightFromBracket} />
                                        </ListItemDecorator>
                                        Sign out
                                    </MenuItem>
                                </Link>
                            </>
                        )}
                    </div>
                </ClickAwayListener>
            </Menu>
        </>
    );
}
