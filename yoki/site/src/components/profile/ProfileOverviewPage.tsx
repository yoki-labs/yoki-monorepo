import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, LinearProgress, Stack, Typography } from "@mui/joy";
import { ProfilePageProps } from "./pages";
import FakeImage from "../stylistic/FakeImage";
import React from "react";
import { notifyFetchError } from "../../utils/errorUtil";
import LandingStat from "../landing/home/LandingStat";
import ProfileStat from "./ProfileStat";

type State = {
    isMounted: boolean;
    isLoaded: boolean;
    cases: number;
    appeals: number;
    awaitingAppeals: number;
};

export default class ProfileOverviewPage extends React.Component<ProfilePageProps, State> {
    constructor(props: ProfilePageProps) {
        super(props);

        this.state = { isMounted: false, isLoaded: false, cases: 0, appeals: 0, awaitingAppeals: 0 };
    }

    async fetchStats() {
        return fetch(`/api/user/stats`, {
            method: "GET",
            headers: { "content-type": "application/json" },
        }).then((response) => {
            if (!response.ok) throw response;
            return response.json();
        });
    }

    async componentDidMount(): Promise<void> {
        if (this.state.isMounted) return;

        this.setState({ isMounted: false });

        return this.fetchStats()
            .then((data) => this.setState({ isLoaded: true, cases: data.cases, appeals: data.appeals, awaitingAppeals: data.awaitingAppeals }))
            .catch((error) => {
                this.setState({ isLoaded: true });

                return notifyFetchError("Error while fetching user stats", error);
            });
    }

    render() {
        const { user } = this.props;
        const { isLoaded, appeals, awaitingAppeals, cases } = this.state;

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
                {isLoaded ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        <ProfileStat amount={cases} what="cases in total" />
                        <ProfileStat amount={appeals} what="appeals in total" />
                        <ProfileStat amount={awaitingAppeals} what="appeals pending" />
                    </div>
                ) : (
                    <LinearProgress />
                )}
            </Stack>
        );
    }
}
