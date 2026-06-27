"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { CLIENT_QUERY } from "@/lib/graphql/clients";
import { Badge } from "@/components/ui/Badge";

const projectStatusLabel: Record<string, string> = {
  ACTIVE: "進行中",
  COMPLETED: "完了",
  ON_HOLD: "保留",
  CANCELLED: "キャンセル",
};
const projectStatusVariant = (
  s: string
): "green" | "blue" | "yellow" | "red" | "gray" | "purple" => {
  const m: Record<
    string,
    "green" | "blue" | "yellow" | "red" | "gray" | "purple"
  > = {
    ACTIVE: "green",
    COMPLETED: "blue",
    ON_HOLD: "yellow",
    CANCELLED: "gray",
  };
  return m[s] ?? "gray";
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useQuery(CLIENT_QUERY, { variables: { id } });

  if (loading)
    return (
      <div className="p-6 text-center text-gray-400">読み込み中...</div>
    );

  const client = data?.client;
  if (!client)
    return (
      <div className="p-6 text-center text-gray-400">
        クライアントが見つかりません
      </div>
    );

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-4">
        <Link href="/clients" className="text-sm text-blue-600 hover:underline">
          ← クライアント一覧
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{client.name}</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">メール</dt>
            <dd className="text-gray-900 font-medium">{client.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">電話</dt>
            <dd className="text-gray-900 font-medium">{client.phone ?? "—"}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500">住所</dt>
            <dd className="text-gray-900 font-medium">
              {client.address ?? "—"}
            </dd>
          </div>
          {client.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500">メモ</dt>
              <dd className="text-gray-900 font-medium whitespace-pre-wrap">
                {client.notes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* プロジェクト一覧 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">プロジェクト</h3>
          <Link
            href={`/projects?clientId=${client.id}`}
            className="text-xs text-blue-600 hover:underline"
          >
            すべて見る
          </Link>
        </div>
        {client.projects.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">プロジェクトはありません</p>
        ) : (
          <div className="space-y-2">
            {client.projects.map(
              (p: {
                id: string;
                name: string;
                status: string;
                startDate: string | null;
                endDate: string | null;
              }) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 -mx-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.startDate ?? ""}
                      {p.endDate ? ` 〜 ${p.endDate}` : ""}
                    </p>
                  </div>
                  <Badge variant={projectStatusVariant(p.status)}>
                    {projectStatusLabel[p.status]}
                  </Badge>
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {/* 契約一覧 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">契約</h3>
        {client.contracts.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">契約はありません</p>
        ) : (
          <div className="space-y-2">
            {client.contracts.map(
              (c: {
                id: string;
                title: string;
                startDate: string;
                endDate: string | null;
              }) => (
                <div key={c.id} className="flex items-center justify-between py-2">
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">
                    {c.startDate} 〜 {c.endDate ?? "継続中"}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
