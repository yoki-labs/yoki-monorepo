import { Box, Stack, Typography } from "@mui/joy";
import CodeWrapper from "../CodeWrapper";
import { SanitizedAppeal } from "../../lib/@types/db";

export default function AppealExpandedInfo({ appeal }: { appeal: SanitizedAppeal; timezone: string | null }) {
    return (
        <Stack gap={3}>
            <Box>
                <Typography level="h2" fontSize="md" gutterBottom>
                    Reason for appealing
                </Typography>
                <CodeWrapper>
                    <Typography textColor="text.secondary">{appeal.content}</Typography>
                </CodeWrapper>
            </Box>
            {appeal.staffNote && (
                <Box>
                    <Typography level="h2" fontSize="md" gutterBottom>
                        Staff note
                    </Typography>
                    <CodeWrapper>
                        <Typography textColor="text.secondary">{appeal.staffNote}</Typography>
                    </CodeWrapper>
                </Box>
            )}
        </Stack>
    );
}
