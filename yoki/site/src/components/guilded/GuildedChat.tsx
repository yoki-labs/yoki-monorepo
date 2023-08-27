import { Box, styled } from "@mui/joy"

const GuildedChat = styled(Box, {
    name: "GuildedChat",
})(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.level1,
    borderRadius: theme.vars.radius.md,
    padding: `8px 0`,
    position: "relative",
    overflow: "hidden",
}));

export const GuildedChatMasked = styled(GuildedChat, {
    name: "GuildedChatMasked",
})(({ theme }) => ({
    height: 400,
    "::after": {
        content: "''",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: "absolute",
        backgroundImage: `linear-gradient(to bottom, transparent 0%, transparent 70%, ${theme.vars.palette.background.level1} 95%)`,
    }
}));

export default GuildedChat;