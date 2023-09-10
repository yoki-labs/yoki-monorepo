import { Box, Typography } from "@mui/joy";
import YokiIcon from "./YokiIcon";
import Link from "next/link";

type Props = {
    
};

export default function Branding({ }: Props) {
    return (
        <Box>
            <Link href="/" style={{ textDecoration: "none" }}>
                <Typography
                    startDecorator={<YokiIcon className="fill-spacelight-700" width="48px" height="48px" />}
                    level="h3"
                    textColor="text.secondary"
                    component="div"
                >
                    Yoki
                </Typography>
            </Link>
        </Box>
    );
}