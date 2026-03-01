"use client";

import Link from "next/link";
import { useState } from "react";

type SidebarProps = {
    activeTab: string;
    onSelect?: (tab: string) => void;
    user: {
        name: string;
        level?: string;
        avatar?: string;
        role?: string;
    };
    collapsed?: boolean;
    onToggle?: (next: boolean) => void;
};

const navItems = [
    { id: "explore", label: "Explore", icon: "🧭", href: "/dashboard" },
    { id: "restaurants", label: "Restaurants", icon: "🍽", href: "/restaurants" },
    { id: "search", label: "Search", icon: "🔍", href: "/search" },
    { id: "nearby", label: "Nearby", icon: "📍", href: "/nearby" },
    { id: "favorites", label: "Favorites", icon: "🔖", href: "/favorites" },
    { id: "reviews", label: "My Reviews", icon: "✍️", href: "/review" },
    { id: "profile", label: "Profile", icon: "👤", href: "/profile" },
];

export default function Sidebar({ activeTab, onSelect, user, collapsed: collapsedProp, onToggle }: SidebarProps) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const collapsed = collapsedProp ?? internalCollapsed;

    const toggleCollapse = () => {
        const next = !collapsed;
        setInternalCollapsed(next);
        onToggle?.(next);
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-full bg-white/90 text-black backdrop-blur border-r border-orange-100/70 flex flex-col z-20 shadow-lg shadow-orange-50 transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
        >
            {/* ── Logo ── */}
            <div className="px-5 py-5 border-b border-orange-100/70 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 min-w-[36px] rounded-xl bg-orange-500 flex items-center justify-center text-white text-lg shadow">
                        🍽
                    </div>
                    {!collapsed && (
                        <span className="text-xl font-extrabold text-gray-800 tracking-tight whitespace-nowrap">
                            Bite<span className="text-orange-500">Finder</span>
                        </span>
                    )}
                </div>
                <button
                    onClick={toggleCollapse}
                    className="text-gray-400 hover:text-orange-500 transition text-sm p-1 rounded-lg hover:bg-orange-50 border border-transparent hover:border-orange-200"
                    title={collapsed ? "Expand" : "Collapse"}
                >
                    {collapsed ? "▶" : "◀"}
                </button>
            </div>

            {/* ── Nav Items ── */}
            <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-hidden">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => onSelect?.(item.id)}
                        title={collapsed ? item.label : ""}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white font-semibold transition-all border ${collapsed ? "justify-center" : ""}
                            ${activeTab === item.id
                                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-md shadow-orange-200 border-orange-500"
                                : "text-gray-900 border-transparent hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"}`}
                    >
                        <span className="text-base min-w-[20px] text-center">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                        {!collapsed && activeTab === item.id && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                        )}
                    </Link>
                ))}

                {/* Admin & Create Restaurant */}
                {user.role === "admin" && (
                    <>
                        <Link
                            href="/admin"
                            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"
                        >
                            <span className="text-base min-w-[20px] text-center">🛡️</span>
                            {!collapsed && <span>Admin</span>}
                        </Link>
                        <Link
                            href="/restaurants/new"
                            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"
                        >
                            <span className="text-base min-w-[20px] text-center">➕</span>
                            {!collapsed && <span>Create Restaurant</span>}
                        </Link>
                    </>
                )}

                {/* Divider */}
                <div className="pt-4 pb-2">
                    <div className="border-t border-orange-100" />
                </div>

                {/* Settings & Help */}
                {[{ id: "settings", label: "Settings", icon: "⚙️", href: "/settings" }, { id: "help", label: "Help", icon: "❓", href: "/help" }].map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        title={collapsed ? item.label : ""}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-orange-50 hover:text-orange-700 transition border border-transparent hover:border-orange-200 ${collapsed ? "justify-center" : ""}`}
                    >
                        <span className="text-base min-w-[20px] text-center">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* ── User Profile Card ── */}
            <div className="px-3 py-4 border-t border-orange-100/70">
                <div
                    className={`flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition cursor-pointer border border-orange-100 ${collapsed ? "justify-center" : ""}`}
                >
                    <div className="w-9 h-9 min-w-[36px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-sm font-bold shadow">
                        {(user.avatar || user.name.slice(0, 2)).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0 ">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                            {user.level && <p className="text-xs text-orange-500 font-medium">{user.level}</p>}
                        </div>
                    )}
                    {!collapsed && (
                        <button className="text-gray-500 hover:text-orange-500 transition text-sm">
                            ↗
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}