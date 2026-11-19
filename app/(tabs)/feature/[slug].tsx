import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { ResourceScreen, resources } from "../../../src/components/resource-screen";
import { ProfileScreen } from "../../../src/components/profile-screen";
import { AiAssistantScreen } from "../../../src/components/ai-assistant-screen";
import { HelpDeskScreen } from "../../../src/components/help-desk-screen";
import { NotificationsScreen } from "../../../src/components/notifications-screen";
import { BillingScreen } from "../../../src/components/billing-screen";
import { DocumentsScreen } from "../../../src/components/documents-screen";
import { WorkforceScreen } from "../../../src/components/workforce-screen";
import { AppearanceScreen } from "../../../src/components/appearance-screen";
export default function Feature() { const { slug } = useLocalSearchParams<{ slug: string }>(); const normalized = slug.startsWith("invoice-") ? "invoice-detail" : slug; const title = normalized === "profile" ? "My profile" : normalized === "assistant" ? "Service assistant" : normalized === "help-desk" ? "Help Desk" : normalized === "notifications" ? "Notifications" : normalized === "billing" ? "Plans & billing" : normalized === "documents" ? "Documents" : normalized === "appearance" ? "Appearance" : resources[normalized]?.title ?? "GharSync"; return <><Drawer.Screen options={{ title }} />{normalized === "profile" ? <ProfileScreen /> : normalized === "appearance" ? <AppearanceScreen /> : normalized === "assistant" ? <AiAssistantScreen /> : normalized === "help-desk" ? <HelpDeskScreen /> : normalized === "notifications" ? <NotificationsScreen /> : normalized === "billing" ? <BillingScreen /> : normalized === "documents" ? <DocumentsScreen /> : normalized === "workforce" ? <WorkforceScreen /> : normalized === "timeoff" ? <WorkforceScreen selfOnly /> : <ResourceScreen slug={normalized} />}</>; }
