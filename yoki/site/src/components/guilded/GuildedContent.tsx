import { Box, styled } from "@mui/joy"
import { ReactNode } from "react";

const GuildedContentWrapper = styled(Box, {
    name: "GuildedContent",
})(({ theme }) => ({
    border: `solid 1px ${theme.vars.palette.neutral.outlinedBorder}`,
    backgroundColor: theme.vars.palette.background.body,
    // padding: `24px 32px`,
    borderRadius: theme.vars.radius.md,
    userSelect: "none",
}));

export default function GuildedContent({ children }: { children: ReactNode | ReactNode[]; }) {
    return (
        <GuildedContentWrapper className="py-0 px-0 md:py-6 md:px-8">
            { children }
        </GuildedContentWrapper>
    );
}