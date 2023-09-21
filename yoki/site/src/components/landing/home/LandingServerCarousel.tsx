// import { AspectRatio, Avatar, Box, Card, CardContent, CardOverflow, Stack, Typography, styled } from "@mui/joy";

// const CarouselWrapper = styled(Box)(({ theme }) => ({
//     borderTop: theme.vars.palette.background.level1,
// }));

// const Carousel = styled(Stack)(({ theme }) => ({
//     position: "relative",
//     overflow: "hidden",
//     "::after": {
//         content: JSON.stringify(""),
//         zIndex: 9999,
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0,
//         position: "absolute",
//         backgroundImage: `linear-gradient(to left, ${theme.vars.palette.background.body} 0%, transparent 10%, transparent 90%, ${theme.vars.palette.background.body} 100%)`,
//         pointerEvents: "none",
//     }
// }));

// const ServerCard = styled(Card)(({ theme }) => ({
//     backgroundColor: theme.vars.palette.background.level1,
//     minWidth: 300,
// }));

// export type Props = {};

// export default function LandingServerCarousel({}: Props) {
//     return (
//         <CarouselWrapper sx={{ py: 4, px: 20 }}>
//             <Typography level="h2" sx={{ mb: 3 }}>Trusted by the biggest servers on Guilded</Typography>
//             <Carousel direction="row" gap={4}>
//                 <LandingCarouselServer name={"Example server 1"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 2"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 3"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 4"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 5"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 6"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 7"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 8"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 9"} icon={""} memberCount={1000} />
//                 <LandingCarouselServer name={"Example server 10"} icon={""} memberCount={1000} />
//             </Carousel>
//         </CarouselWrapper>
//     );
// }

// function LandingCarouselServer({ name, icon, memberCount }: { name: string, icon: string, memberCount: number }) {
//     return (
//         <ServerCard orientation="horizontal">
//             <CardOverflow sx={{ pl: 2 }}>
//                 <Avatar size="lg" />
//             </CardOverflow>
//             <CardContent>
//                 <Typography level="h4">{ name }</Typography>
//                 <Typography level="body-md">{ memberCount } members</Typography>
//             </CardContent>
//         </ServerCard>
//     )
// }

export default null;