import {
    faBan,
    faBrush,
    faClipboardUser,
    faCommentDots,
    faCrown,
    faEnvelope,
    faGhost,
    faHashtag,
    faHeart,
    faImage,
    faLayerGroup,
    faLink,
    faPoo,
    faPrayingHands,
    faShieldHalved,
    faTicket,
    faUserSecret,
    IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { ColorPaletteProp } from "@mui/joy";
import { RoleType } from "@prisma/client";
import React from "react";

import AutomodPage from "./automod/Automod";
import ImagesPage from "./automod/Images";
import InvitesPage from "./automod/Invites";
import PhrasesPage from "./automod/Phrases";
import SpamPage from "./automod/Spam";
import LinksPage from "./automod/Urls";
import AntiraidPage from "./entry/Antiraid";
import AppealsPage from "./entry/Appeals";
import ModmailPage from "./entry/Modmail";
import HistoryPage from "./moderation/History";
import LogsPage from "./moderation/Logs";
import OverviewPage from "./overview/Overview";
import ConfigPage from "./overview/Premium";
import RolesPage from "./overview/Roles";
import { SanitizedServer } from "../../lib/@types/db";
import { GuildedServer } from "../../lib/@types/guilded";
import IgnoresPage from "./automod/Ignores";
import BotProfilePage from "./overview/BotProfile";
import AntinukePage from "./entry/Antinuke";

export interface DashboardPageItem {
    id: string;
    name: string;
    icon: IconDefinition;
    component: typeof React.Component | ((props: DashboardPageProps) => React.ReactElement);
    category: DashboardPageCategory;
    color?: ColorPaletteProp;
    requiredRole: RoleType;
    earlyAccess?: boolean;
    wip?: boolean;
}

export enum DashboardPageCategory {
    Bot,
    Moderation,
    Automod,
    Entry,
}

export const dashboardPageList: DashboardPageItem[] = [
    { id: "overview", name: "Overview", icon: faLayerGroup, component: OverviewPage, category: DashboardPageCategory.Bot, requiredRole: RoleType.MINIMOD },
    { id: "roles", name: "Roles", icon: faCrown, component: RolesPage, category: DashboardPageCategory.Bot, requiredRole: RoleType.ADMIN },
    // { id: "profile", name: "Profile", icon: faBrush, component: BotProfilePage, category: DashboardPageCategory.Bot, requiredRole: RoleType.MINIMOD, wip: true, },
    { id: "premium", name: "Premium", icon: faHeart, color: "warning", component: ConfigPage, category: DashboardPageCategory.Bot, requiredRole: RoleType.MINIMOD },
    { id: "logs", name: "Logging", icon: faHashtag, component: LogsPage, category: DashboardPageCategory.Moderation, requiredRole: RoleType.MOD },
    { id: "cases", name: "Cases", icon: faClipboardUser, component: HistoryPage, category: DashboardPageCategory.Moderation, requiredRole: RoleType.MINIMOD },
    { id: "automod", name: "Automod", icon: faBan, component: AutomodPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.MOD },
    { id: "phrases", name: "Phrase Filter", icon: faCommentDots, component: PhrasesPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.MOD },
    { id: "urls", name: "URL Filter", icon: faLink, component: LinksPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.MOD },
    { id: "invites", name: "Invite Filter", icon: faTicket, component: InvitesPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.MOD },
    { id: "images", name: "Image Filter", icon: faImage, component: ImagesPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.ADMIN },
    { id: "spam", name: "Anti-spam", icon: faPoo, component: SpamPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.ADMIN },
    { id: "ignoring", name: "Ignoring", icon: faGhost, component: IgnoresPage, category: DashboardPageCategory.Automod, requiredRole: RoleType.MOD },
    { id: "modmail", name: "Modmail", icon: faEnvelope, component: ModmailPage, category: DashboardPageCategory.Entry, requiredRole: RoleType.MINIMOD },
    { id: "antiraid", name: "Anti-raid", icon: faShieldHalved, component: AntiraidPage, category: DashboardPageCategory.Entry, requiredRole: RoleType.ADMIN },
    { id: "appeals", name: "Appeals", icon: faPrayingHands, component: AppealsPage, category: DashboardPageCategory.Entry, requiredRole: RoleType.MOD },
    // { id: "antinuke", name: "Anti-nuke", icon: faUserSecret, component: AntinukePage, category: DashboardPageCategory.Entry, requiredRole: RoleType.ADMIN, earlyAccess: true },
];

export interface DashboardPageProps {
    currentServer: GuildedServer;
    serverConfig: SanitizedServer;
    highestRoleType: RoleType;
}
