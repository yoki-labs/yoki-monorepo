import { IconDefinition, faBan, faClipboardUser, faCog, faEnvelope, faHashtag, faLayerGroup, faLinkSlash, faPrayingHands, faShieldHalved, faTextSlash } from "@fortawesome/free-solid-svg-icons";
import OverviewPage from "./pages/Overview";
import ConfigPage from "./pages/Config";
import AutomodPage from "./pages/Automod";
import HistoryPage from "./pages/History";
import ModmailPage from "./pages/Modmail";
import React from "react";
import AntiraidPage from "./pages/Antiraid";
import AppealsPage from "./pages/Appeals";
import LogsPage from "./pages/Logs";
import LinksPage from "./pages/Links";
import PhrasesPage from "./pages/Phrases";

export interface DashboardPageItem {
    id: string;
    name: string;
    icon: IconDefinition;
    component: (typeof React.Component) | ((props: any) => React.ReactElement);
    category: DashboardPageCategory;
}

export enum DashboardPageCategory {
    Bot,
    Automod,
    Entry,
}

export const dashboardPageList: DashboardPageItem[] = [
    { id: "overview", name: "Overview", icon: faLayerGroup, component: OverviewPage, category: DashboardPageCategory.Bot },
    { id: "config", name: "Config", icon: faCog, component: ConfigPage, category: DashboardPageCategory.Bot },
    { id: "automod", name: "Automod", icon: faBan, component: AutomodPage, category: DashboardPageCategory.Automod },
    { id: "logs", name: "Logging", icon: faHashtag, component: LogsPage, category: DashboardPageCategory.Automod },
    { id: "phrases", name: "Phrases", icon: faTextSlash, component: PhrasesPage, category: DashboardPageCategory.Automod },
    { id: "links", name: "Links", icon: faLinkSlash, component: LinksPage, category: DashboardPageCategory.Automod },
    { id: "cases", name: "Cases", icon: faClipboardUser, component: HistoryPage, category: DashboardPageCategory.Automod },
    { id: "modmail", name: "Modmail", icon: faEnvelope, component: ModmailPage, category: DashboardPageCategory.Entry },
    { id: "antiraid", name: "Antiraid", icon: faShieldHalved, component: AntiraidPage, category: DashboardPageCategory.Entry },
    { id: "appeals", name: "Appeals", icon: faPrayingHands, component: AppealsPage, category: DashboardPageCategory.Entry },
];