"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { CLIENTS_QUERY } from "@/lib/graphql/clients";
import { PROJECTS_QUERY } from "@/lib/graphql/projects";
import { INVOICES_QUERY } from "@/lib/graphql/invoices";
import { TASKS_QUERY } from "@/lib/graphql/tasks";
import { Badge } from "@/components/ui/Badge";

const projectStatusLabel: Record<string, string> = {
  ACTIVE: "進行中",
  COMPLETED: "完了",
  ON_HOLD: "保留",
  CANCELLED: "キャンセル",
};

const invoiceStatusLabel: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送付済",
  PAID: "支払済",
  OVERDUE: "期限超過",
  CANCELLED: "キャンセル",
};

const invoiceStatusVariant = (
  status: string
): "gray" | "blue" | "green" | "red" | "yellow" | "purple" => {
  const map: Record<
    string,
    "gray" | "blue" | "green" | "red" | "yellow" | "purple"
  > = {
    DRAFT: "gray",
    SENT: "blue",
    PAID: "green",
    OVERDUE: "red",
    CANCELLED: "gray",
  };
  return map[status] ?? "gray";
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: clientsData } = useQuery(CLIENTS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const { data: invoicesData } = useQuery(INVOICES_QUERY);
  const { data: tasksData } = useQuery(TASKS_QUERY);

  const clients = clientsData?.clients?.data ?? [];
  const projects = projectsData?.projects?.data ?? [];
  const invoices = invoicesData?.invoices?.data ?? [];
  const tasks = tasksData?.tasks?.data ?? [];

  const activeProjects = projects.filter(
    (p: { status: string }) => p.status === "ACTIVE"
  );
  const unpaidInvoices = invoices.filter((i: { status: string }) =>
    ["SENT", "OVERDUE"].includes(i.status)
  );
  const pendingTasks = tasks.filter(
    (t: { status: string }) => t.status !== "DONE"
  );
  const totalUnpaid = unpaidInvoices.reduce(
    (sum: number, i: { totalAmount: number }) => sum + i.totalAmount,
    0
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          こんにちは、{user?.name}さん
        </h2>
        <p className="text-sm text-gray-500 mt-1">業務状況の概要</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <SummaryCard
          label="クライアント数"
          value={clients.length}
          href="/clients"
          color="blue"
        />
        <SummaryCard
          label="進行中プロジェクト"
          value={activeProjects.length}
          href="/projects"
          color="green"
        />
        <SummaryCard
          label="未払い請求書"
          value={`¥${totalUnpaid.toLocaleString()}`}
          href="/invoices"
          color="yellow"
        />
        <SummaryCard
          label="未完了タスク"
          value={pendingTasks.length}
          href="/tasks"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 直近プロジェクト */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              進行中プロジェクト
            </h3>
            <Link
              href="/projects"
              className="text-xs text-blue-600 hover:underline"
            >
              すべて見る
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              進行中のプロジェクトはありません
            </p>
          ) : (
            <div className="space-y-2">
              {activeProjects.slice(0, 5).map(
                (p: {
                  id: string;
                  name: string;
                  status: string;
                  client: { name: string };
                }) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 -mx-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">{p.client?.name}</p>
                    </div>
                    <Badge variant="green">
                      {projectStatusLabel[p.status]}
                    </Badge>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* 未払い請求書 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">未払い請求書</h3>
            <Link
              href="/invoices"
              className="text-xs text-blue-600 hover:underline"
            >
              すべて見る
            </Link>
          </div>
          {unpaidInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              未払い請求書はありません
            </p>
          ) : (
            <div className="space-y-2">
              {unpaidInvoices.slice(0, 5).map(
                (i: {
                  id: string;
                  invoiceNumber: string;
                  status: string;
                  totalAmount: number;
                  dueAt: string | null;
                  project: { name: string };
                }) => (
                  <Link
                    key={i.id}
                    href={`/invoices/${i.id}`}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 -mx-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {i.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {i.project?.name}
                        {i.dueAt && ` · 期限: ${i.dueAt}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        ¥{i.totalAmount.toLocaleString()}
                      </span>
                      <Badge variant={invoiceStatusVariant(i.status)}>
                        {invoiceStatusLabel[i.status]}
                      </Badge>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  href,
  color,
}: {
  label: string;
  value: string | number;
  href: string;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colorClass = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  }[color];

  return (
    <Link href={href}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      </div>
    </Link>
  );
}
