import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Stack, Typography } from "@mui/joy";
import { ProfilePageProps } from "./pages";
import FakeImage from "../stylistic/FakeImage";

export default function ProfileOverviewPage({ user }: ProfilePageProps) {
    return (
        <Stack gap={5}>
            <Card>
                <CardOverflow className="h-32">
                    {user.banner ? (
                        <AspectRatio ratio={8}>
                            <img src={user.banner} alt="Your banner" />
                        </AspectRatio>
                    ) : (
                        <FakeImage ratio={8} number={user.id.charCodeAt(0) % 10} />
                    )}
                    <Box
                        sx={{
                            borderRadius: "100%",
                            bgcolor: "background.level1",
                            position: "absolute",
                            left: 20,
                            bottom: 0,
                            transform: "translateY(90%)",
                            width: 90,
                            height: 90,
                            p: 1,
                        }}
                    >
                        <Avatar sx={{ "--Avatar-size": "100%" }} size="lg" src={user.avatar ?? void 0} />
                    </Box>
                </CardOverflow>
                <CardContent>
                    <Box sx={{ mt: 10, py: 0.5, px: 2 }}>
                        <Box>
                            <Stack direction="row">
                                <Typography level="h2">{user.name}</Typography>
                            </Stack>
                            <Typography level="body-md">/u/{user.subdomain}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    );
}
