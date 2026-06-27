"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: "◻" },
  { href: "/clients", label: "クライアント", icon: "👤" },
  { href: "/projects", label: "プロジェクト", icon: "📁" },
  { href: "/invoices", label: "請求書", icon: "📄" },
  { href: "/work-logs", label: "作業ログ", icon: "⏱" },
  { href: "/expenses", label: "経費", icon: "💰" },
  { href: "/tasks", label: "タスク", icon: "✓" },
  { href: "/contracts", label: "契約", icon: "📝" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-4 py-5 border-b border-gray-200">
        <h1 className="text-base font-bold text-gray-900">フリーランス管理</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1 truncate">{user?.name}</p>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}
