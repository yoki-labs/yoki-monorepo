import { Typography } from "@mui/joy";
import { ReactNode } from "react"

export type Props = {
    children: ReactNode | ReactNode[];
}

export default function GuildedMention({ children }: Props) {
    return (
        <Typography component="span" fontWeight="bolder" color="primary" variant="soft">@{ children }</Typography>  
    );
}