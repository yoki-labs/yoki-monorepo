import { faBolt, faCheckDouble, faGlobeEurope, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, List, ListItem, ListItemDecorator, Stack, Typography, styled } from "@mui/joy";
import Link from "../Link";
import { faGuilded, faTwitter } from "@fortawesome/free-brands-svg-icons";

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
                <Stack sx={{ mt: 4 }} direction="row" gap={12} className="grid grid-cols-1 md:grid-cols-3">
                    <Box>
                        <Typography level="title-md">Web pages</Typography>
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
                        <Typography level="title-md">Check us out</Typography>
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
                                        <FontAwesomeIcon icon={faTwitter} />
                                    </ListItemDecorator>
                                    Twitter
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                    <Box>
                        <Typography level="title-md">Documents</Typography>
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
                </Stack>
            </Stack>
            <Box sx={{ mt: 2 }}>
                <Typography level="body-sm">
                    © 2022 <Link href="/">Yoki Labs</Link>. All Rights Reserved.
                </Typography>
            </Box>
        </FooterWrapper>
        // <footer className="text-white p-4 md:p-8 bg-[#15171d] ">
        //     <div className="md:flex md:justify-between">
        //         <div className="mb-6 md:mb-0 ">
        //             <Link href="/" className="flex items-center hover:cursor-pointer">
        //                 <Image src="/yoki-labs-logo.png" className="mr-3 h-8" alt="FlowBite Logo" width="294" height="80" />
        //             </Link>
        //         </div>
        //         <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
        //             <div>
        //                 <h2 className="mb-6 text-sm font-semibold uppercase">Resources</h2>
        //                 <ul>
        //                     <li className="mb-4">
        //                         <Link href="/docs" className="hover:underline">
        //                             Docs
        //                         </Link>
        //                     </li>
        //                     <li>
        //                         <Link href="/feedback" className="hover:underline">
        //                             Feedback
        //                         </Link>
        //                     </li>
        //                 </ul>
        //             </div>
        //             <div>
        //                 <h2 className="mb-6 text-sm font-semibold uppercase">Follow us</h2>
        //                 <ul>
        //                     <li className="mb-4">
        //                         <Link href="https://github.com/yoki-labs" className="hover:underline">
        //                             Github
        //                         </Link>
        //                     </li>
        //                     <li>
        //                         <Link href="https://twitter.com/yoki_labs" className="hover:underline">
        //                             Twitter
        //                         </Link>
        //                     </li>
        //                 </ul>
        //             </div>
        //             <div>
        //                 <h2 className="mb-6 text-sm font-semibold uppercase">Legal</h2>
        //                 <ul>
        //                     <li className="mb-4">
        //                         <Link href="/privacy" className="hover:underline">
        //                             Privacy Policy
        //                         </Link>
        //                     </li>
        //                     <li>
        //                         <Link href="/tos" className="hover:underline">
        //                             Terms &amp; Conditions
        //                         </Link>
        //                     </li>
        //                 </ul>
        //             </div>
        //         </div>
        //     </div>
        //     <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
        //     <div className="sm:flex sm:items-center sm:justify-between">
        //         <span className="text-sm sm:text-center">
        //             © 2022{" "}
        //             <Link href="/" className="hover:underline">
        //                 Yoki Labs
        //             </Link>
        //             . All Rights Reserved.
        //         </span>
        //     </div>
        // </footer>
    );
}
