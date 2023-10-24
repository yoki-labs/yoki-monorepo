import type { NextPage } from "next";

import LandingPage from "../components/landing/LandingPage";
import { Box, Button, Card, Chip, Link, List, Stack, Typography } from "@mui/joy";
import LandingFeature from "../components/landing/home/LandingFeature";
import LabsButton from "../components/LabsButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGuilded } from "@fortawesome/free-brands-svg-icons";
import LandingProfileCard from "../components/landing/home/LandingProfileCard";
import LandingStat from "../components/landing/home/LandingStat";
import FeaturePreview from "../components/landing/home/FeaturePreview";
import { faEnvelope, faExclamation, faHashtag, faRobot, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import GuildedContentWrapper from "../components/guilded/GuildedContent";
import GuildedChatWrapper, { GuildedChatMasked } from "../components/guilded/GuildedChat";
import GuildedMessage from "../components/guilded/GuildedMessage";
import GuildedEmbed, { GuildedEmbedField } from "../components/guilded/GuildedEmbed";
import GuildedMention from "../components/guilded/GuildedMention";
import { Colors } from "@yokilabs/utils";
import FinalSection from "../components/landing/home/FinalSection";

const Home: NextPage = () => {
    return (
        <LandingPage>
            <Stack direction="column" alignItems="stretch" sx={{ width: "100%" }}>
                <div className="py-20 px-5 md:py-32 md:px-40">
                    <Stack direction="row">
                        <Box sx={{ flex: "1" }}>
                            <Typography level="h1" fontSize="xlg" className="text-5xl pb-4 md:text-7xl">
                                Meet <Typography textColor="primary.500">Yoki</Typography>
                            </Typography>
                            <Typography level="h3">Your moderation companion</Typography>
                            <List size="lg">
                                <LandingFeature>Server auto-moderation</LandingFeature>
                                <LandingFeature>Text, link and image scanning</LandingFeature>
                                <LandingFeature opacity={0.8}>Server & moderation logs</LandingFeature>
                                <LandingFeature opacity={0.6}>Spam prevention</LandingFeature>
                                <LandingFeature opacity={0.4}>Modmail & support</LandingFeature>
                                <LandingFeature opacity={0.2}>Ban appeals</LandingFeature>
                            </List>
                            <Typography textColor="text.primary">... and much more!</Typography>
                            <Stack sx={{ my: 2 }} gap={2} className="flex-col md:flex-row">
                                <a href="/invite">
                                    <LabsButton size="lg" startDecorator={<FontAwesomeIcon icon={faGuilded} className="h-5" />}>
                                         Add to Guilded
                                    </LabsButton>
                                </a>
                                <Button variant="outlined" color="primary" size="lg" onClick={() => window.scrollTo(0, 1200)}>
                                    See all features
                                </Button>
                            </Stack>
                            <Typography textColor="text.secondary">Made by Yoki Labs</Typography>
                        </Box>
                        <LandingProfileCard serverCount={2000} />
                    </Stack>
                </div>
                {/* TODO: Server carousel */}
                {/* Statistics */}
                <div className="pt-28 pb-40 px-5 md:px-40 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    <LandingStat amount="20,000,000+" subtitle="Scanned" what="messages" />
                    <LandingStat amount="10,000+" subtitle="Actioned" what="cases" />
                    <LandingStat amount="1,400+" subtitle="Serving" what="servers" />
                    <LandingStat amount="90,000+" subtitle="Watching over" what="members" />
                    <LandingStat amount="9,000+" subtitle="Stopped" what="bad actors" />
                    <LandingStat amount="6,000+" subtitle="Served" what="captchas" />
                </div>
                {/* Yoki's features */}
                <div className="py-8 px-5 md:px-40">
                    <Box sx={{ textAlign: "center", mb: 24 }}>
                        <Typography level="h1">All the tools you need</Typography>
                        <Typography level="h4" textColor="text.secondary">
                            Yoki provides everything you will ever need to moderate your servers
                        </Typography>
                    </Box>
                    <Stack gap={24}>
                        <FeaturePreview
                            title="Moderation without mods."
                            subtitle="automod"
                            icon={faRobot}
                            description="Our robust content filter scans text, images, invites, and links to keep the content you want and block the content you don't. Comes with numerous presets for popular slurs, NSFW links, profanity, and more."
                        >
                            <GuildedContentWrapper>
                                <GuildedChatWrapper>
                                    <GuildedMessage name="Yoki" bot>
                                        <GuildedEmbed color={`#${Colors.yellow.toString(16)}`}>
                                            <GuildedEmbedField
                                                title={
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faExclamation}
                                                            style={{ color: `#${Colors.yellow.toString(16)}`, width: "1em", height: "1em", marginRight: 12 }}
                                                        />
                                                        Cannot use that word
                                                    </>
                                                }
                                            >
                                                <Typography textColor="text.primary">
                                                    <GuildedMention>User</GuildedMention>, you have used a filtered word. This is a warning for you to not use it again, otherwise
                                                    moderation actions may be taken against you.
                                                </Typography>
                                            </GuildedEmbedField>
                                        </GuildedEmbed>
                                    </GuildedMessage>
                                </GuildedChatWrapper>
                            </GuildedContentWrapper>
                        </FeaturePreview>
                        <FeaturePreview
                            title="Bringing your staff and members closer."
                            subtitle="modmail"
                            icon={faEnvelope}
                            description="Our modmail system provides your server a way for members to communicate directly with your staff. Comes with full chat logs."
                            rightSide
                        >
                            <GuildedContentWrapper>
                                <GuildedChatMasked>
                                    <GuildedMessage name="Yoki" bot>
                                        <GuildedEmbed>
                                            <GuildedEmbedField title="New modmail thread opened">
                                                <Typography textColor="text.primary">
                                                    A new modmail thread by ID R40Mp0WdAnn6Le has been opened by <GuildedMention>User</GuildedMention>.
                                                </Typography>
                                            </GuildedEmbedField>
                                            <GuildedEmbedField title="Roles">
                                                <Chip
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ backgroundColor: "transparent" }}
                                                    startDecorator={
                                                        <Box
                                                            sx={(theme) => ({ width: 16, height: 16, borderRadius: "100%", backgroundColor: theme.vars.palette.primary[500] })}
                                                        ></Box>
                                                    }
                                                >
                                                    Level 30
                                                </Chip>
                                            </GuildedEmbedField>
                                        </GuildedEmbed>
                                        <GuildedEmbed author="Moderator">
                                            <Typography textColor="text.primary">Hello! How can I help you?</Typography>
                                        </GuildedEmbed>
                                        <GuildedEmbed author="User">
                                            <Typography textColor="text.primary">Hey hey! I have a question...</Typography>
                                        </GuildedEmbed>
                                    </GuildedMessage>
                                </GuildedChatMasked>
                            </GuildedContentWrapper>
                        </FeaturePreview>
                        <FeaturePreview
                            title="Stopping bad actors right in their tracks."
                            subtitle="antiraid"
                            icon={faShieldHalved}
                            description="Present new or suspicious accounts with captchas or kick them automatically. Choose from a variety of properties to mark an account as suspicious."
                        >
                            <GuildedContentWrapper>
                                <GuildedChatWrapper>
                                    <GuildedMessage name="Yoki" bot>
                                        <GuildedEmbed color={`#${Colors.yellow.toString(16)}`}>
                                            <GuildedEmbedField
                                                title={
                                                    <>
                                                        <FontAwesomeIcon
                                                            icon={faExclamation}
                                                            style={{ color: `#${Colors.yellow.toString(16)}`, width: "1em", height: "1em", marginRight: 12 }}
                                                        />
                                                        Halt! Please complete this captcha
                                                    </>
                                                }
                                            >
                                                <Typography textColor="text.primary">
                                                    <GuildedMention>User</GuildedMention>, your account has tripped the anti-raid filter and requires further verification to ensure
                                                    that you are not a bot.
                                                </Typography>
                                                <Typography textColor="text.primary" sx={{ mt: 2 }}>
                                                    Please visit <Link>this link</Link> to complete the captcha and use the server.
                                                </Typography>
                                            </GuildedEmbedField>
                                        </GuildedEmbed>
                                    </GuildedMessage>
                                </GuildedChatWrapper>
                            </GuildedContentWrapper>
                        </FeaturePreview>
                        <FeaturePreview
                            title="Giving you a record of everything."
                            subtitle="log channels"
                            icon={faHashtag}
                            description="Track message edits/deletions, member joins/leaves, moderator actions, and much more with log channels."
                            rightSide
                        >
                            <GuildedContentWrapper>
                                <GuildedChatMasked>
                                    <GuildedMessage name="Yoki" bot>
                                        <GuildedEmbed color={`#${Colors.yellow.toString(16)}`} footer={<Typography textColor="text.tertiary">Aug 27, 2023</Typography>}>
                                            <GuildedEmbedField title="User joined">
                                                <Typography textColor="text.primary">
                                                    <GuildedMention>User</GuildedMention> has joined the server.
                                                </Typography>
                                            </GuildedEmbedField>
                                            <GuildedEmbedField title="Additional info">
                                                <Typography textColor="text.primary">
                                                    <Typography component="span" fontWeight="bolder">
                                                        Account created:
                                                    </Typography>{" "}
                                                    August 27, 2023 at 10:00 AM EST
                                                </Typography>
                                                <Typography textColor="text.primary">
                                                    <Typography component="span" fontWeight="bolder">
                                                        Joined at:
                                                    </Typography>{" "}
                                                    August 27, 2023 at 11:30 AM EST
                                                </Typography>
                                            </GuildedEmbedField>
                                        </GuildedEmbed>
                                        <GuildedEmbed color={`#${Colors.red.toString(16)}`} footer={<Typography textColor="text.tertiary">Aug 27, 2023</Typography>}>
                                            <GuildedEmbedField title="User warned">
                                                <Typography textColor="text.primary">
                                                    <GuildedMention>User</GuildedMention> has been warned by <GuildedMention>Moderator</GuildedMention>.
                                                </Typography>
                                            </GuildedEmbedField>
                                            <GuildedEmbedField title="Reason">
                                                <Box sx={{ backgroundColor: "black", py: 2, px: 2, borderRadius: 4 }}>
                                                    <Typography>Being disrespectful to others.</Typography>
                                                </Box>
                                            </GuildedEmbedField>
                                            <GuildedEmbedField title="Additional info">
                                                <Typography textColor="text.primary">
                                                    <Typography component="span" fontWeight="bolder">
                                                        Infraction points:
                                                    </Typography>{" "}
                                                    5
                                                </Typography>
                                                <Typography textColor="text.primary">
                                                    <Typography component="span" fontWeight="bolder">
                                                        Case ID:
                                                    </Typography>{" "}
                                                    R40Mp0WdAnn6Le
                                                </Typography>
                                            </GuildedEmbedField>
                                        </GuildedEmbed>
                                    </GuildedMessage>
                                </GuildedChatMasked>
                            </GuildedContentWrapper>
                        </FeaturePreview>
                    </Stack>
                </div>
                {/* Final invite section */}
                <FinalSection />
            </Stack>
        </LandingPage>
    );
};

export default Home;
