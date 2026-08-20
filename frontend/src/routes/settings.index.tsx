import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { SectionTitle, MenuGroup, MenuRow } from "@/components/omeetso/account";
import {
  Languages, Palette, MapPin, Bell, Lock, Megaphone, Users, Shield, Trash2, LogOut,
  Radar, Search, History, Download, User, Settings2,
} from "lucide-react";

export const Route = createFileRoute("/settings/")({
  head: () => ({ meta: [{ title: "Settings — Omeetso" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12">
        <BackBar title="Settings" />
        <div className="space-y-3 px-4 pt-2">
          <SectionTitle>General</SectionTitle>
          <MenuGroup>
            <MenuRow icon={Palette} label="Appearance" to="/settings/appearance" />
            <MenuRow icon={MapPin} label="Location" to="/settings/locations" />
            <MenuRow icon={Radar} label="Default search radius" onClick={() => { window.location.href = "/settings/locations"; }} />
          </MenuGroup>

          <SectionTitle>Notifications</SectionTitle>
          <MenuGroup>
            <MenuRow icon={Bell} label="Notification preferences" to="/notifications/preferences" />
          </MenuGroup>

          <SectionTitle>Privacy</SectionTitle>
          <MenuGroup>
            <MenuRow icon={Lock} label="Privacy settings" to="/settings/privacy" />
            <MenuRow icon={Megaphone} label="Advertisement preferences" to="/settings/ad-preferences" />
          </MenuGroup>

          <SectionTitle>Safety</SectionTitle>
          <MenuGroup>
            <MenuRow icon={Users} label="Blocked users" to="/settings/blocked" />
            <MenuRow icon={Shield} label="Login activity" onClick={() => alert("Login activity is a placeholder in this preview.")} />
            <MenuRow icon={Settings2} label="Account security" onClick={() => alert("Account security controls will be enabled after real auth is added.")} />
          </MenuGroup>

          <SectionTitle>Data</SectionTitle>
          <MenuGroup>
            <MenuRow icon={Search} label="Clear search history" onClick={() => { try { localStorage.removeItem("omeetso_recent_searches"); } catch {} alert("Search history cleared."); }} />
            <MenuRow icon={History} label="Clear recently viewed" onClick={() => { try { localStorage.removeItem("omeetso_recent_viewed"); } catch {} alert("Recently viewed cleared."); }} />
            <MenuRow icon={Download} label="Download account data" onClick={() => alert("Data export is a placeholder in this preview.")} />
          </MenuGroup>

          <SectionTitle>Account</SectionTitle>
          <MenuGroup>
            <MenuRow icon={User} label="Account management" to="/settings/account" />
            <MenuRow icon={Trash2} label="Deactivate account" to="/settings/deactivate" />
            <MenuRow icon={Trash2} label="Delete account" to="/settings/delete" />
            <MenuRow icon={LogOut} label="Logout" to="/logout" />
          </MenuGroup>
        </div>
      </div>
    </MobileFrame>
  );
}
