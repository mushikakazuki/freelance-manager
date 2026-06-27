"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { PROJECT_QUERY } from "@/lib/graphql/projects";
import { Badge } from "@/components/ui/Badge";

const projectStatusLabel: Record<string, string> = {
  ACTIVE: "進行中",
  COMPLETED: "完了",
  ON_HOLD: "保留",
  CANCELLED: "キャンセル",
};
const projectStatusVariant = (
  s: string
): "green" | "blue" | "yellow" | "gray" | "red" | "purple" => {
  const m: Record<
    string,
    "green" | "blue" | "yellow" | "gray" | "red" | "purple"
  > = {
    ACTIVE: "green",
    COMPLETED: "blue",
    ON_HOLD: "yellow",
    CANCELLED: "gray",
  };
  return m[s] ?? "gray";
};
const invoiceStatusLabel: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送付済",
  PAID: "支払済",
  OVERDUE: "期限超過",
  CANCELLED: "キャンセル",
};
const invoiceStatusVariant = (
  s: string
): "gray" | "blue" | "green" | "red" | "yellow" | "purple" => {
  const m: Record<
    string,
    "gray" | "blue" | "green" | "red" | "yellow" | "purple"
  > = {
    DRAFT: "gray",
    SENT: "blue",
    PAID: "green",
    OVERDUE: "red",
    CANCELLED: "gray",
  };
  return m[s] ?? "gray";
};
const taskPriorityLabel: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};
const taskStatusLabel: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useQuery(PROJECT_QUERY, { variables: { id } });

  if (loading)
    return <div className="p-6 text-center text-gray-400">読み込み中...</div>;

  const project = data?.project;
  if (!project)
    return (
      <div className="p-6 text-center text-gray-400">
        プロジェクトが見つかりません
      </div>
    );

  const totalHours = project.workLogs.reduce(
    (sum: number, w: { hours: number }) => sum + w.hours,
    0
  );
  const totalExpenses = project.expenses.reduce(
    (sum: number, e: { amount: number }) => sum + e.amount,
    0
  );

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4">
        <Link href="/projects" className="text-sm text-blue-600 hover:underline">
          ← プロジェクト一覧
        </Link>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
          <Badge variant={projectStatusVariant(project.status)}>
            {projectStatusLabel[project.status]}
          </Badge>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">クライアント</dt>
            <dd className="font-medium">
              <Link href={`/clients/${project.client.id}`} className="text-blue-600 hover:underline">
                {project.client.name}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">時間単価</dt>
            <dd className="font-medium">
              {project.hourlyRate != null
                ? `¥${project.hourlyRate.toLocaleString()}/h`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">開始日</dt>
            <dd className="font-medium">{project.startDate ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">終了日</dt>
            <dd className="font-medium">{project.endDate ?? "—"}</dd>
          </div>
          {project.description && (
            <div className="col-span-2">
              <dt className="text-gray-500">説明</dt>
              <dd className="font-medium whitespace-pre-wrap">
                {project.description}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">総作業時間</p>
            <p className="text-lg font-bold text-gray-900">{totalHours}h</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">総経費</p>
            <p className="text-lg font-bold text-gray-900">
              ¥{totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 請求書 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">請求書</h3>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">管理</Link>
          </div>
          {project.invoices.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">請求書はありません</p>
          ) : (
            <div className="space-y-2">
              {project.invoices.map(
                (i: {
                  id: string;
                  invoiceNumber: string;
                  status: string;
                  totalAmount: number;
                  dueAt: string | null;
                }) => (
                  <Link
                    key={i.id}
                    href={`/invoices/${i.id}`}
                    className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded px-2 -mx-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {i.invoiceNumber}
                      </p>
                      {i.dueAt && (
                        <p className="text-xs text-gray-500">期限: {i.dueAt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
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

        {/* タスク */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">タスク</h3>
            <Link href="/tasks" className="text-xs text-blue-600 hover:underline">管理</Link>
          </div>
          {project.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">タスクはありません</p>
          ) : (
            <div className="space-y-2">
              {project.tasks.slice(0, 5).map(
                (t: {
                  id: string;
                  title: string;
                  status: string;
                  priority: string;
                  dueDate: string | null;
                }) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      {t.dueDate && (
                        <p className="text-xs text-gray-500">期限: {t.dueDate}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={t.priority === "HIGH" ? "red" : t.priority === "MEDIUM" ? "yellow" : "gray"}>
                        {taskPriorityLabel[t.priority]}
                      </Badge>
                      <Badge variant={t.status === "DONE" ? "green" : t.status === "IN_PROGRESS" ? "blue" : "gray"}>
                        {taskStatusLabel[t.status]}
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* 作業ログ */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">作業ログ</h3>
            <Link href="/work-logs" className="text-xs text-blue-600 hover:underline">管理</Link>
          </div>
          {project.workLogs.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">作業ログはありません</p>
          ) : (
            <div className="space-y-2">
              {project.workLogs.slice(0, 5).map(
                (w: {
                  id: string;
                  workedDate: string;
                  hours: number;
                  description: string | null;
                }) => (
                  <div key={w.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{w.workedDate}</p>
                      {w.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{w.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{w.hours}h</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* 経費 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">経費</h3>
            <Link href="/expenses" className="text-xs text-blue-600 hover:underline">管理</Link>
          </div>
          {project.expenses.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">経費はありません</p>
          ) : (
            <div className="space-y-2">
              {project.expenses.slice(0, 5).map(
                (e: {
                  id: string;
                  category: string;
                  description: string;
                  amount: number;
                  incurredAt: string;
                }) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{e.description}</p>
                      <p className="text-xs text-gray-500">{e.incurredAt}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ¥{e.amount.toLocaleString()}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
