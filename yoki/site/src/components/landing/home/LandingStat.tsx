import { IconDefinition, faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, Typography } from "@mui/joy";
import { ReactNode } from "react";

type Props = {
    icon: IconDefinition;
    subtitle: string;
    amount: ReactNode | ReactNode[];
    what: string;
};

export default function LandingStat({ icon, subtitle, amount: numbers, what }: Props) {
    return (
        <Card>
            <CardContent sx={{ py: 2, px: 4 }}>
                <Typography level="body-md" sx={{ textAlign: "center" }}>
                    {subtitle}
                </Typography>
                <Typography level="h3" fontWeight="normal" sx={{ textAlign: "center" }}>
                    <FontAwesomeIcon icon={icon} />{" "}
                    <Typography fontWeight="bolder" sx={{ ml: 1 }}>
                        {numbers}
                    </Typography>{" "}
                    {what}
                </Typography>
            </CardContent>
        </Card>
    );
}
