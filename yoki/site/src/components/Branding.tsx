import { Box, Typography } from "@mui/joy";
import YokiIcon from "./YokiIcon";

type Props = {
    
};

export default function Branding({ }: Props) {
    return (
        <Box>
            <Typography
                startDecorator={<YokiIcon className="fill-spacelight-700" width="48px" height="48px" />}
                level="h4"
                textColor="text.secondary"
                component="div"
            >
                Yoki
            </Typography>
        </Box>
    );
}