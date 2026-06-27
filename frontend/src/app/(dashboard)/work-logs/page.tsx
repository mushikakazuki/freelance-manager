"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  WORK_LOGS_QUERY,
  CREATE_WORK_LOG_MUTATION,
  UPDATE_WORK_LOG_MUTATION,
  DELETE_WORK_LOG_MUTATION,
} from "@/lib/graphql/workLogs";
import { PROJECTS_QUERY } from "@/lib/graphql/projects";
import { Modal } from "@/components/ui/Modal";

type WorkLog = {
  id: string;
  projectId: string;
  workedDate: string;
  hours: number;
  description: string | null;
  hourlyRate: number | null;
  project: { id: string; name: string };
};

type WorkLogForm = {
  projectId: string;
  workedDate: string;
  hours: string;
  description: string;
  hourlyRate: string;
};

const emptyForm: WorkLogForm = {
  projectId: "",
  workedDate: new Date().toISOString().split("T")[0],
  hours: "",
  description: "",
  hourlyRate: "",
};

export default function WorkLogsPage() {
  const { data, loading, refetch } = useQuery(WORK_LOGS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkLog | null>(null);
  const [form, setForm] = useState<WorkLogForm>(emptyForm);

  const [createWorkLog] = useMutation(CREATE_WORK_LOG_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateWorkLog] = useMutation(UPDATE_WORK_LOG_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteWorkLog] = useMutation(DELETE_WORK_LOG_MUTATION, {
    onCompleted: () => refetch(),
  });

  const workLogs: WorkLog[] = data?.workLogs?.data ?? [];
  const projects = projectsData?.projects?.data ?? [];

  const totalHours = workLogs.reduce((sum, w) => sum + w.hours, 0);

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, projectId: projects[0]?.id ?? "" });
    setIsModalOpen(true);
  };
  const openEdit = (w: WorkLog) => {
    setEditTarget(w);
    setForm({
      projectId: w.projectId,
      workedDate: w.workedDate,
      hours: String(w.hours),
      description: w.description ?? "",
      hourlyRate: w.hourlyRate != null ? String(w.hourlyRate) : "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const common = {
      workedDate: form.workedDate,
      hours: parseFloat(form.hours),
      description: form.description || null,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
    };
    if (editTarget) {
      updateWorkLog({ variables: { id: editTarget.id, input: common } });
    } else {
      createWorkLog({ variables: { input: { projectId: form.projectId, ...common } } });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    deleteWorkLog({ variables: { id } });
  };

  const set = (key: keyof WorkLogForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">作業ログ</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {workLogs.length} 件 · 総計{" "}
            <span className="font-semibold text-gray-700">{totalHours}h</span>
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 記録
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : workLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          作業ログはまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">日付</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">プロジェクト</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">時間</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">単価</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">売上</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">内容</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {workLogs.map((w) => {
                const revenue = w.hourlyRate != null ? w.hours * w.hourlyRate : null;
                return (
                  <tr key={w.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{w.workedDate}</td>
                    <td className="px-4 py-3 text-gray-600">{w.project?.name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{w.hours}h</td>
                    <td className="px-4 py-3 text-gray-600">
                      {w.hourlyRate != null ? `¥${w.hourlyRate.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {revenue != null ? `¥${revenue.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {w.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(w)} className="text-gray-500 hover:text-blue-600 text-xs">編集</button>
                        <button onClick={() => handleDelete(w.id)} className="text-gray-500 hover:text-red-600 text-xs">削除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editTarget ? "作業ログを編集" : "作業ログを記録"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {!editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト *</label>
              <select
                value={form.projectId}
                onChange={set("projectId")}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {projects.map((p: { id: string; name: string }) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">作業日 *</label>
            <input type="date" value={form.workedDate} onChange={set("workedDate")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間 *</label>
              <input type="number" step="0.5" value={form.hours} onChange={set("hours")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="8" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間単価（円）</label>
              <input type="number" value={form.hourlyRate} onChange={set("hourlyRate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea value={form.description} onChange={set("description")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editTarget ? "更新" : "記録"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
