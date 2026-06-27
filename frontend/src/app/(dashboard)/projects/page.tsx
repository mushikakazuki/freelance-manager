"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import {
  PROJECTS_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from "@/lib/graphql/projects";
import { CLIENTS_QUERY } from "@/lib/graphql/clients";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

type Project = {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  hourlyRate: number | null;
  client: { id: string; name: string };
};

type ProjectForm = {
  clientId: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  hourlyRate: string;
};

const emptyForm: ProjectForm = {
  clientId: "",
  name: "",
  description: "",
  status: "ACTIVE",
  startDate: "",
  endDate: "",
  hourlyRate: "",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "進行中",
  COMPLETED: "完了",
  ON_HOLD: "保留",
  CANCELLED: "キャンセル",
};
const statusVariant = (
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

export default function ProjectsPage() {
  const { data, loading, refetch } = useQuery(PROJECTS_QUERY);
  const { data: clientsData } = useQuery(CLIENTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const [createProject] = useMutation(CREATE_PROJECT_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION, {
    onCompleted: () => refetch(),
  });

  const projects: Project[] = data?.projects?.data ?? [];
  const clients = clientsData?.clients?.data ?? [];

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, clientId: clients[0]?.id ?? "" });
    setIsModalOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditTarget(p);
    setForm({
      clientId: p.clientId,
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? "",
      hourlyRate: p.hourlyRate != null ? String(p.hourlyRate) : "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      clientId: form.clientId,
      name: form.name,
      description: form.description || null,
      status: form.status,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
    };
    if (editTarget) {
      updateProject({ variables: { id: editTarget.id, input } });
    } else {
      createProject({ variables: { input } });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    deleteProject({ variables: { id } });
  };

  const set = (key: keyof ProjectForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">プロジェクト</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} 件</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 追加
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          プロジェクトはまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">プロジェクト名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">クライアント</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">期間</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">単価</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/projects/${p.id}`} className="font-medium text-blue-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.client?.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(p.status)}>
                      {statusLabel[p.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {p.startDate ?? "—"} 〜 {p.endDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.hourlyRate != null ? `¥${p.hourlyRate.toLocaleString()}/h` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-blue-600 text-xs">編集</button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-gray-500 hover:text-red-600 text-xs">削除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editTarget ? "プロジェクトを編集" : "プロジェクトを追加"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">クライアント *</label>
            <select
              value={form.clientId}
              onChange={set("clientId")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {clients.map((c: { id: string; name: string }) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名 *</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(statusLabel).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <input type="date" value={form.startDate} onChange={set("startDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input type="date" value={form.endDate} onChange={set("endDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時間単価（円）</label>
            <input type="number" value={form.hourlyRate} onChange={set("hourlyRate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editTarget ? "更新" : "作成"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
