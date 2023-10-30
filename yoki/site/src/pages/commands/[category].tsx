import type { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import LandingPage from "../../components/landing/LandingPage";
import { Command } from "../../lib/Command";
import commands from "../../../commands.json";
import { Box, Stack, Typography } from "@mui/joy";
import CommandSidebar from "../../components/landing/commands/CommandSidebar";
import CommandDisplay from "../../components/landing/commands/CommandDisplay";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { LabsSessionUser } from "../../utils/pageUtil";

interface GroupedCommands {
    [x: string]: Command[];
}

type CommandProps = {
    commandByCategory: GroupedCommands;
    commandCategories: Record<string, string>;
    category: string;
    user?: LabsSessionUser;
};

const commandByCategory = commands.reduce<GroupedCommands>((group, command) => {
    const category = command.category ?? "General";

    group[category] = group[category] ?? [];
    group[category].push(command as Command);

    return group;
}, {});
// const commandCategories = Object.keys(commandByCategory);
const commandCategories = Object.keys(commandByCategory).reduce<Record<string, string>>(
    (categories, category) => ((categories[category.split(" ").join("").toLowerCase()] = category), categories),
    {}
);
const categoryKeys = Object.keys(commandCategories);

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<CommandProps>> => {
    const category = ctx.query.category as string;
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    const user = (session && { id: session.user.id, name: session.user.name, avatar: session.user.avatar }) ?? void 0;

    // Can do hard cache if user isn't logged in
    if (!user)
        ctx.res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=59");

    // Doesn't exist
    if (!categoryKeys.includes(category)) return { redirect: { destination: "/commands/general", permanent: false } };

    return {
        props: {
            user,
            commandByCategory,
            commandCategories,
            category,
        },
    };
};

const Commands: NextPage<CommandProps> = ({ user, commandByCategory, commandCategories, category }) => {
    const commands = commandByCategory[commandCategories[category]];

    return (
        <LandingPage user={user}>
            <div className="flex w-full px-5 py-12 flex-col md:flex-row md:px-40">
                <CommandSidebar categories={commandCategories} activeCategory={category} />
                <div className="grow md:px-16">
                    <Typography level="h2" sx={{ mb: 4 }}>
                        {commandCategories[category]}
                    </Typography>
                    <Stack gap={2} direction="column" alignItems="stretch">
                        {commands.map((x) => (
                            <CommandDisplay command={x} />
                        ))}
                    </Stack>
                </div>
            </div>
        </LandingPage>
    );
};

export default Commands;
