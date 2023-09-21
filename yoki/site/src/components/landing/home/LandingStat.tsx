import { Card, CardContent, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    subtitle: string;
    amount: ReactNode | ReactNode[];
    what: string;
};

export default function LandingStat({ subtitle, amount: numbers, what }: Props) {
    return (
        <Card>
            <CardContent sx={{ py: 2, px: 4 }}>
                <Typography level="body-md">{subtitle}</Typography>
                <Typography level="h3" fontWeight="normal">
                    <Typography fontWeight="bolder">{numbers}</Typography> {what}
                </Typography>
            </CardContent>
        </Card>
    );
}
