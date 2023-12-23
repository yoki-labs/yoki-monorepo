import type { GetServerSideProps, NextPage } from "next";

import LandingPage from "../components/landing/LandingPage";
import { Box, Stack, Table, Typography } from "@mui/joy";
import { LandingPageSessionProps, getLandingPagePageProps } from "../utils/pageUtil";
import PremiumCard from "../components/landing/PremiumCard";
import { faCheck, faHeart, faSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import AlertIcon from "../components/AlertIcon";

export const getServerSideProps: GetServerSideProps<LandingPageSessionProps> = getLandingPagePageProps;

const Premium: NextPage<LandingPageSessionProps> = ({ user }) => {
    return (
        <LandingPage user={user}>
            <Stack direction="column" alignItems="center" sx={{ width: "100%", pt: 16 }}>
                <Box sx={{ textAlign: "center", mb: 16 }}>
                    <Typography level="h1">
                        Power <Typography textColor="primary.500" sx={{ textDecoration: "underline" }}>all</Typography> Yoki Labs bots in your server
                    </Typography>
                    <Typography level="h4" textColor="text.secondary">
                        Subscribe to Yoki Labs premium to receive additional perks and benefits
                    </Typography>
                </Box>
                <Box className="grid grid-cols-1 px-2 md:px-40 md:grid-cols-3 gap-10">
                    <PremiumCard
                        tierName="Copper"
                        cost={2.5}
                        perks={[
                            { text: "You allow us to continue doing what we love", icon: faHeart, color: "danger" },
                            { text: "Faster & more responsive support" },
                            { text: "Early access to new features" },
                            { text: "More currencies, items" },
                        ]}
                        />
                    <PremiumCard
                        tierName="Silver"
                        cost={10}
                        perks={[
                            { text: "You allow us to continue doing what we love", icon: faHeart, color: "danger" },
                            { text: "Faster & more responsive support" },
                            { text: "Yoki's NSFW image filter" },
                            { text: "Even more currencies, items" },
                        ]}
                    />
                    <PremiumCard
                        tierName="Gold"
                        cost={20}
                        perks={[
                            { text: "You allow us to continue doing what we love", icon: faHeart, color: "danger" },
                            { text: "Faster & more responsive support" },
                            { text: "Yoki's NSFW image filter" },
                            { text: "Unlimited items, currencies" },
                        ]}
                    />
                </Box>
                <Box sx={{ textAlign: "center", mt: 16, mb: 12 }}>
                    <Typography level="h2">
                        Premium feature comparison
                    </Typography>
                </Box>
                <Box sx={{ mb: 20 }} className="px-2 md:px-40">
                    <Table size="lg" variant="plain" stripe="even" sx={(theme) => ({ th: { textAlign: "center" }, td: { textAlign: "center" }, "--TableRow-stripeBackground": theme.vars.palette.background.level0, borderRadius: 16, overflow: "hidden" })}>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Free</th>
                                <th>Copper</th>
                                <th>Silver</th>
                                <th>Gold</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Filtering and auto-mod
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Verification and anti-raid
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Modmail
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Appeals
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Logging
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Bot customizability
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faSlash} color="warning" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Faster support response
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faTimes} color="neutral" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        NSFW image filtering
                                    </Typography>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faTimes} color="neutral" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faTimes} color="neutral" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                                <td>
                                    <Stack direction="column" alignItems="center"><AlertIcon icon={faCheck} color="success" variant="soft" /></Stack>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Allowed currencies per server
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="text.primary">
                                        3
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.200">
                                        6
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.300">
                                        8
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.500">
                                        12
                                    </Typography>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Allowed income commands per server
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="text.primary">
                                        10
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.200">
                                        20
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.300">
                                        30
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.500">
                                        50
                                    </Typography>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ textAlign: "left" }}>
                                    <Typography level="body-md" textColor="text.primary">
                                        Allowed items per server
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="text.primary">
                                        20
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.200">
                                        35
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.300">
                                        45
                                    </Typography>
                                </td>
                                <td>
                                    <Typography level="body-md" fontWeight="bolder" textColor="primary.500">
                                        60
                                    </Typography>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Box>
            </Stack>
        </LandingPage>
    );
};

export default Premium;
