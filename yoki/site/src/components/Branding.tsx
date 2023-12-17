import { Box, Typography } from "@mui/joy";
import YokiIcon from "./YokiIcon";
import Link from "next/link";

type Props = {};

export default function Branding({}: Props) {
    return (
        <Box>
            <Link href="/" style={{ textDecoration: "none" }}>
                <Typography startDecorator={<YokiIcon className="fill-spacedark_fore-400" width="32px" height="32px" />} level="h4" textColor="text.secondary" component="div">
                    Yoki
                </Typography>
            </Link>
        </Box>
    );
}
