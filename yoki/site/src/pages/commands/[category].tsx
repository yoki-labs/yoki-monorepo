import type { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { LandingPage } from "../../components/landing/LandingPage";
import { Command } from "../../lib/Command";
import commands from "../../../commands.json";
import { Box, Stack, Typography } from "@mui/joy";
import CommandSidebar from "../../components/landing/commands/CommandSidebar";
import CommandDisplay from "../../components/landing/commands/CommandDisplay";

interface GroupedCommands {
    [x: string]: Command[];
}

type CommandProps = {
    commandByCategory: GroupedCommands;
    commandCategories: Record<string, string>;
    category: string;
};

const commandByCategory = commands.reduce<GroupedCommands>((group, command) => {
    const category = command.category ?? "General";

    group[category] = group[category] ?? [];
    group[category].push(command as Command);

    return group;
}, {});
// const commandCategories = Object.keys(commandByCategory);
const commandCategories = Object
    .keys(commandByCategory)
    .reduce<Record<string, string>>((categories, category) =>
        (categories[category.split(" ").join("").toLowerCase()] = category, categories),
        {}
    );
const categoryKeys = Object.keys(commandCategories);

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<CommandProps>> => {
    const category = ctx.query.category as string;

    ctx.res.setHeader(
        "Cache-Control",
        "public, s-maxage=10, stale-while-revalidate=59"
    );

    // Doesn't exist
    if (!categoryKeys.includes(category))
        return { redirect: { destination: "/commands/general", permanent: false } };

    return {
        props: {
            commandByCategory,
            commandCategories,
            category,
        },
    };
};

const Commands: NextPage<CommandProps> = ({ commandByCategory, commandCategories, category }) => {
    const commands = commandByCategory[commandCategories[category]];

    return (
        <LandingPage>
            <Stack sx={{ py: 6, px: 20 }} direction="row">
                <CommandSidebar categories={commandCategories} activeCategory={category} />
                <Box sx={{ px: 8, flex: "1" }}>
                    <Typography level="h2" sx={{ mb: 4 }}>{commandCategories[category]}</Typography>
                    <Stack gap={2} direction="column" alignItems="stretch">
                        {commands.map((x) =>
                            <CommandDisplay command={x} />
                        )}
                    </Stack>
                </Box>
            </Stack>
        </LandingPage>
    );
};

export default Commands;
