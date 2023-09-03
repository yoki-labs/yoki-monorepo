import { Stack, Typography } from "@mui/joy";
import React from "react";

export enum PagePlaceholderIcon {
    NotFound,
    Wip,
    NoPermission,
    Unexpected,
}

const icons: Record<PagePlaceholderIcon, string> = {
    [PagePlaceholderIcon.NotFound]: "¯\\_ (ツ)_/¯",
    [PagePlaceholderIcon.Wip]: "(｡-‿-｡)💤",
    [PagePlaceholderIcon.NoPermission]: "( •́ ‸ •̀ )",
    [PagePlaceholderIcon.Unexpected]: "( •́ _ •́ )?"
};

type Props = {
    icon: PagePlaceholderIcon;
    title: string;
    description: string;
};

export default class PagePlaceholder extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { icon, title, description } = this.props;

        return (
            <Stack direction="column" alignItems="center">
                <Typography level="h2" textColor="text.secondary" fontSize="xlg" gutterBottom>{ icons[icon] }</Typography>
                <Typography level="h1" fontSize="lg">{ title }</Typography>
                <Typography level="body-md" textColor="text.secondary">{ description }</Typography>
            </Stack>
        )
    }
}