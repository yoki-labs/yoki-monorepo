import { Avatar, Box, Card, Stack, Typography, styled } from "@mui/joy";
import React, { ReactNode } from "react";

type Props = {
    color?: string;
    children: ReactNode | ReactNode[];
    footer?: ReactNode | ReactNode[];
    author?: string;
};

const EmbedWrapper = styled(Box, {
    name: "GuildedEmbed",
    slot: "root",
})(({ theme }) => ({
    background: theme.vars.palette.background.embedded,
    borderRadius: theme.vars.radius.xs,
    border: `solid 1px ${theme.vars.palette.divider}`,
    overflow: "hidden",
}));

const EmbedContainer = styled(Stack, {
    name: "GuildedEmbed",
    slot: "container",
})(({ theme }) => ({
    flexDirection: "row",
    padding: `12px 16px`,
}));

const EmbedAuthor = styled(Stack, {
    name: "GuildedEmbed",
    slot: "author",
})(({ theme }) => ({
    flexDirection: "row",
    padding: `12px 16px 0px 16px`,
    alignItems: "center",
    gap: 8,
}));

const EmbedFooter = styled(Stack, {
    name: "GuildedEmbed",
    slot: "footer",
})(({ theme }) => ({
    flexDirection: "row",
    padding: `8px 16px`,
    gap: 4,
    backgroundColor: theme.vars.palette.background.embeddedfooter,
}));

const EmbedContent = styled(Stack, {
    name: "GuildedEmbed",
    slot: "content",
})(({ theme }) => ({
    flex: "1",
    flexDirection: "column",
    gap: 16,
}));

const GuildedEmbed = React.forwardRef<unknown, Props>((props, ref) => {
    const { color, author, footer, children } = props;

    return (
        <EmbedWrapper ref={ref} sx={{ borderLeft: color && `solid 3px ${color}` }}>
            {author && (
                <EmbedAuthor>
                    <Avatar size="sm">{author[0]}</Avatar>
                    <Typography component="span" fontWeight="bolder">
                        {author}
                    </Typography>
                </EmbedAuthor>
            )}
            <EmbedContainer>
                <EmbedContent>{children}</EmbedContent>
            </EmbedContainer>
            {footer && <EmbedFooter>{footer}</EmbedFooter>}
        </EmbedWrapper>
    );
});

export function GuildedEmbedField({ title, children }: { title: ReactNode | ReactNode[]; children: ReactNode | ReactNode[] }) {
    return (
        <Box component="section">
            <Typography level="title-md" fontWeight="bolder" gutterBottom>
                {title}
            </Typography>
            <Box component="article">{children}</Box>
        </Box>
    );
}

export default GuildedEmbed;
