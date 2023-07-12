import { Card, CardContent, Typography } from "@mui/joy";
import { ContentFilter } from "@prisma/client";

export function PhraseCard({ content, severity, matching, creatorId, createdAt, infractionPoints }: ContentFilter) {
    return (
        <Card>
            <CardContent>
                <Typography level="h6">{content}</Typography>
            </CardContent>
        </Card>
    );
}