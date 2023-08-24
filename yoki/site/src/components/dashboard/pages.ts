import { IconDefinition, faBan, faClipboardUser, faCog, faCommentDots, faCrown, faEnvelope, faHashtag, faHeart, faLayerGroup, faLink, faLinkSlash, faPrayingHands, faShieldHalved, faTextSlash, faTicket } from "@fortawesome/free-solid-svg-icons";
import OverviewPage from "./overview/Overview";
import ConfigPage from "./overview/Premium";
import AutomodPage from "./automod/Automod";
import HistoryPage from "./automod/History";
import ModmailPage from "./entry/Modmail";
import React from "react";
import AntiraidPage from "./entry/Antiraid";
import AppealsPage from "./entry/Appeals";
import LogsPage from "./automod/Logs";
import LinksPage from "./automod/Urls";
import PhrasesPage from "./automod/Phrases";
import { ColorPaletteProp } from "@mui/joy";
import { SanitizedServer } from "../../lib/@types/db";
import RolesPage from "./overview/Roles";
import InvitesPage from "./automod/Invites";

export interface DashboardPageItem {
    id: string;
    name: string;
    icon: IconDefinition;
    component: (typeof React.Component) | ((props: any) => React.ReactElement);
    category: DashboardPageCategory;
    color?: ColorPaletteProp;
}

export enum DashboardPageCategory {
    Bot,
    Automod,
    Entry,
}

export const dashboardPageList: DashboardPageItem[] = [
    { id: "overview", name: "Overview", icon: faLayerGroup, component: OverviewPage, category: DashboardPageCategory.Bot },
    { id: "roles", name: "Roles", icon: faCrown, component: RolesPage, category: DashboardPageCategory.Bot },
    { id: "premium", name: "Premium", icon: faHeart, color: "warning", component: ConfigPage, category: DashboardPageCategory.Bot },
    { id: "automod", name: "Automod", icon: faBan, component: AutomodPage, category: DashboardPageCategory.Automod },
    { id: "logs", name: "Logging", icon: faHashtag, component: LogsPage, category: DashboardPageCategory.Automod },
    { id: "cases", name: "Cases", icon: faClipboardUser, component: HistoryPage, category: DashboardPageCategory.Automod },
    { id: "phrases", name: "Phrase Filter", icon: faCommentDots, component: PhrasesPage, category: DashboardPageCategory.Automod },
    { id: "urls", name: "URL Filter", icon: faLink, component: LinksPage, category: DashboardPageCategory.Automod },
    { id: "invites", name: "Invite Filter", icon: faTicket, component: InvitesPage, category: DashboardPageCategory.Automod },
    { id: "modmail", name: "Modmail", icon: faEnvelope, component: ModmailPage, category: DashboardPageCategory.Entry },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved, component: AntiraidPage, category: DashboardPageCategory.Entry },
    { id: "appeals", name: "Appeals", icon: faPrayingHands, component: AppealsPage, category: DashboardPageCategory.Entry },
];

export type DashboardPageProps = {
    serverConfig: SanitizedServer;
};