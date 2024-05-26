import { AspectRatio, Avatar, Box, Sheet, Typography, styled } from "@mui/joy";

const height = 250;
const width = 600;

export const WelcomeBannerCanvas = styled(Box, {
    name: "WelcomeBanner",
})(({ theme }) => ({
    // width,
    // height,
    // width: "100%",
    padding: "10px 20%",
    backgroundColor: "transparent",
}));

export const WelcomeBannerContainer = styled(Box, {
    name: "WelcomeBanner",
})(({ theme }) => ({
    // width,
    // height,
    // width: "100%",
    height: "10rem",
    overflow: "hidden",
    position: "relative",
    borderRadius: theme.vars.radius.lg,
}));

export const WelcomeBannerWrapper = styled(Box, {
    name: "WelcomeBanner",
})(({ theme }) => ({
    // width,
    // height: height * 1.5,
    width: "100%",
    height: "150%",
    background: `linear-gradient(to bottom right, ${theme.vars.palette.neutral[800]} 0%, ${theme.vars.palette.background.body} 40%, ${theme.vars.palette.neutral[700]} 90%)`,
    position: "absolute",
    top: 0,
}));

export const WelcomeBannerContent = styled(Box, {
    name: "WelcomeBanner",
})(({ theme }) => ({
    // width,
    // height: height * 1.5,
    // width: "100%",
    height: "66%",
    position: "relative",
}));

export const WelcomeBannerText = styled(Typography, {
    name: "WelcomeBanner",
})(({ theme }) => ({
    // width,
    // height: height * 1.5,
    // width: "100%",
    height: "66%",
    position: "relative",
}));

type Props = {
    avatar?: string | null | undefined;
};

export default function WelcomeBanner({ avatar }: Props) {
    return (
        <WelcomeBannerCanvas>
            <AspectRatio ratio={2.4} slotProps={{ content: { sx: { background: "transparent" } } }}>
                <WelcomeBannerContainer>
                    <WelcomeBannerWrapper>
                        <WelcomeBannerContent>
                            <Avatar src={avatar ?? void 0} sx={{ top: "20%", left: "41.66%", height: "40%", width: "16.6%", borderRadius: "40%" }} />
                            <Typography
                                component="div"
                                level="inline-code"
                                textColor="text.primary"
                                fontWeight="bolder"
                                sx={{ position: "absolute", fontSize: "3vh", top: "72%", width: "100%", textAlign: "center" }}
                            >
                                Welcome,{" "}
                                <Typography color="primary" variant="soft" sx={{ paddingBlock: "0.05em", paddingInline: "0.2em" }}>
                                    @ExampleUser
                                </Typography>
                                , to the server!
                            </Typography>
                        </WelcomeBannerContent>
                    </WelcomeBannerWrapper>
                </WelcomeBannerContainer>
            </AspectRatio>
        </WelcomeBannerCanvas>
    );
}
