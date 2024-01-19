import { Stack, Typography } from "@mui/joy";
import React, { ReactNode } from "react";

export enum PagePlaceholderIcon {
    NotFound,
    Wip,
    NoPermission,
    Unexpected,
}

const icons: Record<PagePlaceholderIcon, string> = {
    [PagePlaceholderIcon.NotFound]: "¯\\_ (ツ)_/¯",
    [PagePlaceholderIcon.Wip]: "(｡- ‿ -｡)💤",
    [PagePlaceholderIcon.NoPermission]: "( •́ ‸ •̀ )",
    [PagePlaceholderIcon.Unexpected]: "( •́ _ •́ )?",
};

type Props = {
    icon: PagePlaceholderIcon;
    title: string;
    children: ReactNode | ReactNode[];
};

export default class PagePlaceholder extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { icon, title, children } = this.props;

        return (
            <Stack direction="column" alignItems="center">
                <Typography level="body-md" textColor="text.secondary" fontSize="xlg" sx={{ fontSize: "2.5em" }} gutterBottom>
                    {icons[icon]}
                </Typography>
                <Typography level="h1" fontSize="lg">
                    {title}
                </Typography>
                <Typography level="body-md" textAlign="center" textColor="text.secondary">
                    {children}
                </Typography>
            </Stack>
        );
    }
}
