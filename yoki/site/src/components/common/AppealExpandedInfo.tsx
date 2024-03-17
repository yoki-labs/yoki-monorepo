import { Box, Stack, Typography } from "@mui/joy";
import CodeWrapper from "../CodeWrapper";
import { SanitizedAppeal } from "../../lib/@types/db";
import { LabsCopyInput } from "../LabsCopyInput";
import Link from "../Link";

export default function AppealExpandedInfo({ appeal, appealLink }: { appealLink: string; appeal: SanitizedAppeal; timezone: string | null }) {
    return (
        <Stack gap={3}>
            {/* <Link href={appealLink}>See more</Link> */}
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
            <Box>
                <Typography level="h3" fontSize="md" gutterBottom>
                    Identifier
                </Typography>
                <LabsCopyInput text={appeal.id} sx={{ width: "max-content" }} />
            </Box>
        </Stack>
    );
}
