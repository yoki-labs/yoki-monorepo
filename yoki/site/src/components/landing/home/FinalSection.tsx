import { faGuilded } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Card, Link, Stack, Typography, styled } from "@mui/joy";
import { labsSecondaryColour } from "../../../styles/theme";
import { CurvyMask } from "../masked";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const FinalSectionCard = styled(Card)(({ theme }) => ({
    position: "relative",
    backgroundImage: `linear-gradient(to bottom right, ${labsSecondaryColour[0]}, ${labsSecondaryColour[1]})`,
    overflow: "hidden",
}));

const CardDecorationWrapper = styled(`div`)(({ theme }) => ({
    content: "''",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    userSelect: "none",
}));

const CardDecorationContainer = styled(`div`)(({ theme }) => ({
    position: "relative",
    height: "100%",
    width: "100%",
}));

const DecorationStarStack = styled(`div`)(({ theme }) => ({
    display: "grid",
    gap: 40,
    paddingLeft: 20,
    paddingTop: 20,
}));

export default function FinalSection() {
    return (
        <div className="px-5 md:px-40">
            <FinalSectionCard className="py-8 px-8 mt-40 mb-20 md:py-32 md:px-32" color="primary" variant="solid" invertedColors>
                <CardDecorationWrapper>
                    <CardDecorationContainer>
                        <CurvyMask placement="bottom" start="80%" sx={{ width: "100%", height: "150%", transform: "rotate(-10deg) translateY(20px) translateX(250px)" }}>
                            <Box sx={{ width: "100%", height: "100%", backgroundImage: "linear-gradient(to bottom right, rgba(255, 255, 255, 0.3), transparent)" }}></Box>
                        </CurvyMask>
                        {/* TODO: Change this whole grid to be SVG and use components for stars inside that SVG */}
                        <DecorationStarStack sx={{ position: "absolute", top: 0, left: 0, mask: "linear-gradient(to bottom right, white 0%, transparent 65%)" }}>
                            <StarSvg top={0} left={0} column={1} />
                            <StarSvg top={60} left={0} column={2} />
                            <StarSvg top={13} left={12} column={3} />
                            <StarSvg top={60} left={30} column={4} />
                            <StarSvg top={40} left={40} column={5} />
                            <StarSvg top={10} left={20} column={6} />
                            <StarSvg top={70} left={40} column={7} />
                            <StarSvg top={10} left={20} column={8} />

                            <StarSvg top={60} left={20} column={1} />
                            <StarSvg top={10} left={45} column={2} />
                            <StarSvg top={40} left={50} column={3} />
                            <StarSvg top={90} left={0} column={4} />
                            <StarSvg top={0} left={0} column={5} />
                            <StarSvg top={32} left={10} column={6} />
                            <StarSvg top={0} left={40} column={7} />
                            <StarSvg top={30} left={0} column={8} />

                            <StarSvg top={20} left={10} column={1} />
                            <StarSvg top={0} left={30} column={2} />
                            <StarSvg top={60} left={20} column={3} />
                            <StarSvg top={40} left={10} column={4} />
                            <StarSvg top={30} left={30} column={5} />
                            <StarSvg top={23} left={50} column={6} />
                            <StarSvg top={30} left={20} column={7} />
                            <StarSvg top={0} left={40} column={8} />
                        </DecorationStarStack>
                    </CardDecorationContainer>
                </CardDecorationWrapper>
                <Stack sx={{ alignItems: "center", zIndex: 2 }}>
                    <Typography level="h2" gutterBottom>
                        Have hassle-free moderation today
                    </Typography>
                    <Link href="/invite">
                        <Button size="lg" startDecorator={<FontAwesomeIcon icon={faGuilded} />} variant="solid">
                            Add Yoki to your server
                        </Button>
                    </Link>
                </Stack>
            </FinalSectionCard>
        </div>
    );
}

function StarSvg({ top, left, column }: { top?: number; left?: number; column?: number }) {
    return (
        <svg viewBox="0 0 16 16" style={{ width: 20, height: 20, marginTop: top, marginLeft: left, gridColumn: column }} fill="white">
            <ellipse cx="8" cy="8" rx="1.5" ry="8" />
            <ellipse cx="8" cy="8" rx="8" ry="1.5" />
        </svg>
    );
}
