import type { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import LandingPage from "../../components/landing/LandingPage";
import { Command } from "../../lib/Command";
import commands from "../../../commands.json";
import { Box, Stack, Typography } from "@mui/joy";
import CommandSidebar from "../../components/landing/commands/CommandSidebar";
import CommandDisplay from "../../components/landing/commands/CommandDisplay";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { LabsSessionUser } from "../../utils/routes/pages";
import { IconDefinition, faBrush, faDoorOpen, faEnvelope, faFilterCircleXmark, faGlobeAmericas, faHammer, faInfoCircle, faShield } from "@fortawesome/free-solid-svg-icons";

interface GroupedCommands {
    [x: string]: Command[];
}

type CommandProps = {
    commandByCategory: GroupedCommands;
    commandCategories: Record<string, { icon: IconDefinition; name: string; url: string }>;
    category: string;
    user: LabsSessionUser | null;
};

const commandCategoryList: Array<{ icon: IconDefinition; name: string; url: string }> = [
    {
        name: "General",
        url: "general",
        icon: faGlobeAmericas,
    },
    {
        name: "Information",
        url: "information",
        icon: faInfoCircle,
    },
    {
        name: "Customization",
        url: "customization",
        icon: faBrush,
    },
    {
        name: "Moderation",
        url: "moderation",
        icon: faHammer,
    },
    {
        name: "Automod",
        url: "automod",
        icon: faShield,
    },
    {
        name: "Filter",
        url: "filter",
        icon: faFilterCircleXmark,
    },
    {
        name: "Modmail",
        url: "modmail",
        icon: faEnvelope,
    },
    {
        name: "Server Entry",
        url: "serverentry",
        icon: faDoorOpen,
    },
];

const commandByCategory = commands.reduce<GroupedCommands>((group, command) => {
    const categoryName = command.category ?? "General";
    const category = commandCategoryList.find((x) => x.name === categoryName)!.url;

    group[category] = group[category] ?? [];
    group[category].push(command as Command);

    return group;
}, {});
// const commandCategories = Object.keys(commandByCategory);
const commandCategories = commandCategoryList.reduce<Record<string, { name: string; url: string; icon: IconDefinition }>>(
    (categories, category) => ((categories[category.url] = category), categories),
    {}
);
const categoryKeys = commandCategoryList.map((x) => x.url);

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<CommandProps>> => {
    const category = ctx.query.category as string;
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    const user = (session?.user.id && { id: session.user.id, name: session.user.name, avatar: session.user.avatar }) || null;

    // Can do hard cache if user isn't logged in
    if (!user) ctx.res.setHeader("Cache-Control", "public, s-maxage=10, stale-while-revalidate=59");

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
    const commands = commandByCategory[commandCategories[category].url];
    console.log("Commands", commands);

    return (
        <LandingPage user={user}>
            <div className="flex w-full px-5 py-12 flex-col md:flex-row md:px-40">
                <CommandSidebar categories={commandCategories} activeCategory={category} />
                <div className="grow md:px-16">
                    <Typography level="h2" sx={{ mb: 4 }}>
                        {commandCategories[category].name}
                    </Typography>
                    <Stack gap={2} direction="column" alignItems="stretch">
                        {commands.map((x, i) => (
                            <CommandDisplay key={`commands.${i}`} command={x} />
                        ))}
                    </Stack>
                </div>
            </div>
        </LandingPage>
    );
};

export default Commands;
