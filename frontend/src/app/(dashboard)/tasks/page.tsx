"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  TASKS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
} from "@/lib/graphql/tasks";
import { PROJECTS_QUERY } from "@/lib/graphql/projects";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  project: { id: string; name: string };
};

type TaskForm = {
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
};

const emptyForm: TaskForm = {
  projectId: "",
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
};

const statusLabel: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  DONE: "完了",
};
const statusVariant = (
  s: string
): "gray" | "blue" | "green" | "red" | "yellow" | "purple" => {
  const m: Record<
    string,
    "gray" | "blue" | "green" | "red" | "yellow" | "purple"
  > = {
    TODO: "gray",
    IN_PROGRESS: "blue",
    DONE: "green",
  };
  return m[s] ?? "gray";
};
const priorityLabel: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};
const priorityVariant = (
  p: string
): "gray" | "yellow" | "red" | "blue" | "green" | "purple" => {
  const m: Record<
    string,
    "gray" | "yellow" | "red" | "blue" | "green" | "purple"
  > = {
    LOW: "gray",
    MEDIUM: "yellow",
    HIGH: "red",
  };
  return m[p] ?? "gray";
};

export default function TasksPage() {
  const { data, loading, refetch } = useQuery(TASKS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [createTask] = useMutation(CREATE_TASK_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    onCompleted: () => refetch(),
  });

  const allTasks: Task[] = data?.tasks?.data ?? [];
  const tasks =
    filterStatus === "ALL"
      ? allTasks
      : allTasks.filter((t) => t.status === filterStatus);
  const projects = projectsData?.projects?.data ?? [];

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, projectId: projects[0]?.id ?? "" });
    setIsModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditTarget(t);
    setForm({
      projectId: t.projectId,
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ?? "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const common = {
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };
    if (editTarget) {
      updateTask({ variables: { id: editTarget.id, input: common } });
    } else {
      createTask({ variables: { input: { projectId: form.projectId, ...common } } });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    deleteTask({ variables: { id } });
  };

  const quickUpdateStatus = (task: Task, status: string) => {
    updateTask({
      variables: {
        id: task.id,
        input: { status, completedAt: status === "DONE" ? new Date().toISOString() : null },
      },
    });
  };

  const set = (key: keyof TaskForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">タスク</h2>
          <p className="text-sm text-gray-500 mt-0.5">{allTasks.length} 件</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 追加
        </button>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-4">
        {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {s === "ALL" ? "すべて" : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          タスクはありません
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-4"
            >
              <button
                onClick={() =>
                  quickUpdateStatus(
                    t,
                    t.status === "DONE" ? "TODO" : t.status === "TODO" ? "IN_PROGRESS" : "DONE"
                  )
                }
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  t.status === "DONE"
                    ? "bg-green-500 border-green-500 text-white"
                    : t.status === "IN_PROGRESS"
                    ? "border-blue-500"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                {t.status === "DONE" && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${t.status === "DONE" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {t.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {t.project?.name}
                  {t.dueDate && ` · 期限: ${t.dueDate}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={priorityVariant(t.priority)}>
                  {priorityLabel[t.priority]}
                </Badge>
                <Badge variant={statusVariant(t.status)}>
                  {statusLabel[t.status]}
                </Badge>
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-blue-600 text-xs ml-1">編集</button>
                <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 text-xs">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editTarget ? "タスクを編集" : "タスクを追加"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {!editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト *</label>
              <select value={form.projectId} onChange={set("projectId")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">選択してください</option>
                {projects.map((p: { id: string; name: string }) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
            <input type="text" value={form.title} onChange={set("title")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea value={form.description} onChange={set("description")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <select value={form.priority} onChange={set("priority")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(priorityLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select value={form.status} onChange={set("status")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(statusLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限</label>
            <input type="date" value={form.dueDate} onChange={set("dueDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editTarget ? "更新" : "追加"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
