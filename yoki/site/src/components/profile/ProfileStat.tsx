import { Card, CardContent, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    amount: ReactNode | ReactNode[];
    what: string;
};

export default function ProfileStat({ amount: numbers, what }: Props) {
    return (
        <Card>
            <CardContent sx={{ py: 2, px: 4 }}>
                <Typography level="h3" fontWeight="normal" textColor="text.secondary">
                    <Typography fontWeight="bolder" textColor="text.primary">{numbers}</Typography> {what}
                </Typography>
            </CardContent>
        </Card>
    );
}
