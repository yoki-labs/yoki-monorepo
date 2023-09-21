import {
    faBan,
    faClipboardUser,
    faCommentDots,
    faCrown,
    faEnvelope,
    faHashtag,
    faHeart,
    faLayerGroup,
    faLink,
    faPoo,
    faPrayingHands,
    faShieldHalved,
    faTicket,
    IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { ColorPaletteProp } from "@mui/joy";
import React from "react";

import AutomodPage from "./automod/Automod";
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

export interface DashboardPageItem {
    id: string;
    name: string;
    icon: IconDefinition;
    component: typeof React.Component | ((props: DashboardPageProps) => React.ReactElement);
    category: DashboardPageCategory;
    color?: ColorPaletteProp;
}

export enum DashboardPageCategory {
    Bot,
    Moderation,
    Automod,
    Entry,
}

export const dashboardPageList: DashboardPageItem[] = [
    { id: "overview", name: "Overview", icon: faLayerGroup, component: OverviewPage, category: DashboardPageCategory.Bot },
    { id: "roles", name: "Roles", icon: faCrown, component: RolesPage, category: DashboardPageCategory.Bot },
    { id: "premium", name: "Premium", icon: faHeart, color: "warning", component: ConfigPage, category: DashboardPageCategory.Bot },
    { id: "logs", name: "Logging", icon: faHashtag, component: LogsPage, category: DashboardPageCategory.Moderation },
    { id: "cases", name: "Cases", icon: faClipboardUser, component: HistoryPage, category: DashboardPageCategory.Moderation },
    { id: "automod", name: "Automod", icon: faBan, component: AutomodPage, category: DashboardPageCategory.Automod },
    { id: "phrases", name: "Phrase Filter", icon: faCommentDots, component: PhrasesPage, category: DashboardPageCategory.Automod },
    { id: "urls", name: "URL Filter", icon: faLink, component: LinksPage, category: DashboardPageCategory.Automod },
    { id: "invites", name: "Invite Filter", icon: faTicket, component: InvitesPage, category: DashboardPageCategory.Automod },
    { id: "spam", name: "Anti-spam", icon: faPoo, component: SpamPage, category: DashboardPageCategory.Automod },
    { id: "modmail", name: "Modmail", icon: faEnvelope, component: ModmailPage, category: DashboardPageCategory.Entry },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved, component: AntiraidPage, category: DashboardPageCategory.Entry },
    { id: "appeals", name: "Appeals", icon: faPrayingHands, component: AppealsPage, category: DashboardPageCategory.Entry },
];

export interface DashboardPageProps {
    serverConfig: SanitizedServer;
}
