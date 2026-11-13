// Site navigation in one place: the desktop sidebar's sections and the phone tab bar's tabs, the engine's
// and the site's modules'.
import type { ReactNode } from "react";
import { NAV } from "@aihot/site";
import { webModules } from "../../site-modules";
import {
  IconBolt, IconBookmark, IconDoc, IconFlame, IconGrid, IconHeart, IconHistory, IconList, IconMessage, IconPlug, IconUser,
} from "../icons";

export interface NavItem {
  to: string;
  label: string;
  icon: (p: { size?: number }) => ReactNode;
  /** Match the path exactly (the home page). */
  end?: boolean;
  /** Other pages the entry stands for: they and the pages under them light it too. */
  covers?: string[];
  /** Shows the unread dot while the changelog has news. */
  changelog?: boolean;
}

const SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "콘텐츠",
    items: [
      { to: "/", label: "엄선", icon: IconBolt, end: true },
      { to: "/all", label: "전체 동향", icon: IconList },
      { to: "/hot", label: "핫 이슈", icon: IconFlame },
      { to: "/daily", label: "일간", icon: IconDoc, covers: ["/weekly", "/monthly"] },
      { to: "/topics", label: "주제", icon: IconGrid },
      { to: "/starred", label: "즐겨찾기", icon: IconBookmark },
    ],
  },
  {
    title: "더 보기",
    items: [
      { to: "/agent", label: "Agent 접속", icon: IconPlug },
      { to: "/about", label: "소개", icon: IconHeart },
      { to: "/changelog", label: "업데이트 로그", icon: IconHistory, changelog: true },
      { to: "/feedback", label: "피드백", icon: IconMessage },
    ],
  },
];

/** Whether an engine page is a way in from the navigation (site.ts NAV.hidden); a hidden page still opens. */
export const inNav = (to: string) => !(NAV.hidden as readonly string[]).includes(to);

const UP = {
  "/hot": { name: "핫 이슈", back: "핫 이슈", tab: "hot" },
  "/topics": { name: "주제", back: "주제", tab: "me" },
} as const;

/**
 * Where pages under a navigation entry lead back up to: the entry, or 엄선 in its place while the site hides
 * it. `name` is for breadcrumbs and desktop back links (핫 이슈), `back` for the phone bar (핫 이슈), `tab` the
 * phone tab it sits under, `crumbs` its breadcrumb after the site's home.
 */
export function navUp(entry: keyof typeof UP): { to: string; name: string; back: string; tab: TabKey; crumbs: Array<{ name: string; path: string }> } {
  if (!inNav(entry)) return { to: "/", name: "엄선", back: "엄선", tab: "featured", crumbs: [] };
  return { to: entry, ...UP[entry], crumbs: [{ name: UP[entry].name, path: entry }] };
}

/**
 * The sidebar: the engine's sections with the modules' between 콘텐츠 and 더 보기; a module naming a section
 * that is already there adds to it.
 */
export function sidebar(): Array<{ title: string; items: NavItem[] }> {
  const [content, ...rest] = SECTIONS;
  const more = rest.pop()!;
  const sections = [content!, ...rest].map((s) => ({ ...s, items: s.items.filter((i) => inNav(i.to)) }));
  for (const m of webModules()) {
    if (!m.sidebar) continue;
    const section = sections.find((s) => s.title === m.sidebar!.section);
    if (section) section.items.push(...m.sidebar.items);
    else sections.push({ title: m.sidebar.section, items: [...m.sidebar.items] });
  }
  return [...sections, more];
}

/** A sidebar entry is lit on its pages and the ones it covers (일간 also covers weekly and monthly reports). */
export function sidebarIsActive(item: Pick<NavItem, "to" | "end" | "covers">, pathname: string): boolean {
  if (item.end) return pathname === item.to;
  return [item.to, ...(item.covers ?? [])].some((to) => pathname === to || pathname.startsWith(`${to}/`));
}

/**
 * The deepest entry a path belongs to: a page can sit under more than one entry of its section (a module's
 * list and a detail page under it), and only the most specific one is lit.
 */
export function activeSidebarItem(items: readonly NavItem[], pathname: string): NavItem | null {
  let lit: NavItem | null = null;
  for (const item of items) {
    if (sidebarIsActive(item, pathname) && (!lit || item.to.length > lit.to.length)) lit = item;
  }
  return lit;
}

/**
 * The phone tab bar: 전체 동향 lives beside 엄선 as a switch, 핫 이슈 and 일간 are tabs, and "마이" at /more holds
 * 즐겨찾기, 테마, the tools and the site's own pages. Which tab a page sits under is declared by the page
 * itself (components/shell/screens.ts).
 */
export type TabKey =
  | "featured"
  | "hot"
  | "daily"
  | "me"
  // A module's tab.
  | (string & {});

export interface Tab {
  key: TabKey;
  to: string;
  label: string;
  icon: (p: { size?: number }) => ReactNode;
  /** As NavItem.covers. */
  covers?: string[];
  changelog?: boolean;
}

const ENGINE_TABS: Tab[] = [
  { key: "featured", to: "/", label: "엄선", icon: IconBolt },
  { key: "hot", to: "/hot", label: "핫 이슈", icon: IconFlame },
  { key: "daily", to: "/daily", label: "일간", icon: IconDoc, covers: ["/weekly", "/monthly"] },
  { key: "me", to: "/more", label: "마이", icon: IconUser, changelog: true },
];

/** The tab bar: the engine's, the modules' before 마이. */
export function tabs(): Tab[] {
  return [...ENGINE_TABS.slice(0, -1).filter((t) => inNav(t.to)), ...webModules().flatMap((m) => m.tabs ?? []), ENGINE_TABS.at(-1)!];
}

/**
 * The rail that stands in for the sidebar on narrow desktops (unfolded foldables, tablets upright): the
 * tabs, with 전체 동향 after 엄선 since desktop pages have no 엄선 | 전체 동향 switch.
 */
export function rail(): Tab[] {
  const all = tabs();
  if (!inNav("/all")) return all;
  const at = all.findIndex((t) => t.key === "featured") + 1;
  return [...all.slice(0, at), { key: "all", to: "/all", label: "전체 동향", icon: IconList }, ...all.slice(at)];
}

/** A rail entry is lit on its pages; 마이 also on the pages that sit under it on phones. */
export function railIsActive(tab: Tab, pathname: string, screenTab: TabKey | undefined): boolean {
  if (tab.key === "me") return pathname === tab.to || screenTab === "me";
  return sidebarIsActive({ to: tab.to, end: tab.to === "/", covers: tab.covers }, pathname);
}
