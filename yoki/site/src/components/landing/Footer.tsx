import { faBolt, faCheckDouble, faGlobeEurope, faLock, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, List, ListItem, ListItemDecorator, Stack, Typography, styled } from "@mui/joy";
import Link from "../Link";
import { faGuilded, faTwitter, faXTwitter } from "@fortawesome/free-brands-svg-icons";

const FooterWrapper = styled(Box, {
    name: "FooterWrapper",
})(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.body,
    borderTop: `solid 1px ${theme.vars.palette.divider}`,
}));

export default function Footer() {
    return (
        <FooterWrapper component="footer" className="py-12 px-10 md:px-40">
            <Stack className="direction-column gap-10 md:direction-row md:gap-0">
                <Box sx={{ flex: "1" }}>
                    <Typography level="h1">
                        <Typography component="span" textColor="primary.500">
                            Yoki
                        </Typography>
                        Labs
                    </Typography>
                </Box>
                <Stack sx={{ mt: 4 }} direction="row" gap={12} className="grid grid-cols-2 md:grid-cols-4">
                    <Box>
                        <Typography level="title-md" textColor="text.tertiary">Legal</Typography>
                        <List>
                            <ListItem>
                                <Link color="neutral" textColor="text.secondary" href="/terms">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faCheckDouble} />
                                    </ListItemDecorator>
                                    Terms of Use
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link color="neutral" textColor="text.secondary" href="/privacy">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faLock} />
                                    </ListItemDecorator>
                                    Privacy Policy
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                    <Box>
                        <Typography level="title-md" textColor="text.tertiary">Socials</Typography>
                        <List>
                            <ListItem>
                                <Link color="neutral" textColor="text.secondary" href="/support">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faGuilded} />
                                    </ListItemDecorator>
                                    Guilded
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link color="neutral" textColor="text.secondary" href="/twitter">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faXTwitter} />
                                    </ListItemDecorator>
                                    X (Twitter)
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                    <Box>
                        <Typography level="title-md" textColor="text.tertiary">Web applets</Typography>
                        <List>
                            <ListItem>
                                <Link color="neutral" textColor="text.secondary" href="/dashboard">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faBolt} />
                                    </ListItemDecorator>
                                    Dashboard
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                    <Box>
                        <Typography level="title-md" textColor="text.tertiary">Documentation</Typography>
                        <List>
                            <ListItem>
                                <Link color="neutral" textColor="text.secondary" href="/commands">
                                    <ListItemDecorator>
                                        <FontAwesomeIcon icon={faTerminal} />
                                    </ListItemDecorator>
                                    Commands
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                </Stack>
            </Stack>
            <Box sx={{ mt: 3 }}>
                <Typography level="body-sm">
                    © 2022 <Link href="/">Yoki Labs</Link>. All Rights Reserved.
                </Typography>
            </Box>
        </FooterWrapper>
    );
}
