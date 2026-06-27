"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  EXPENSES_QUERY,
  CREATE_EXPENSE_MUTATION,
  UPDATE_EXPENSE_MUTATION,
  DELETE_EXPENSE_MUTATION,
} from "@/lib/graphql/expenses";
import { PROJECTS_QUERY } from "@/lib/graphql/projects";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

type Expense = {
  id: string;
  projectId: string;
  category: string;
  description: string;
  amount: number;
  incurredAt: string;
  receiptUrl: string | null;
  project: { id: string; name: string };
};

type ExpenseForm = {
  projectId: string;
  category: string;
  description: string;
  amount: string;
  incurredAt: string;
  receiptUrl: string;
};

const emptyForm: ExpenseForm = {
  projectId: "",
  category: "OTHER",
  description: "",
  amount: "",
  incurredAt: new Date().toISOString().split("T")[0],
  receiptUrl: "",
};

const categoryLabel: Record<string, string> = {
  TRANSPORTATION: "交通費",
  SUPPLIES: "消耗品",
  OUTSOURCING: "外注費",
  OTHER: "その他",
};
const categoryVariant = (
  c: string
): "blue" | "green" | "purple" | "gray" | "yellow" | "red" => {
  const m: Record<
    string,
    "blue" | "green" | "purple" | "gray" | "yellow" | "red"
  > = {
    TRANSPORTATION: "blue",
    SUPPLIES: "green",
    OUTSOURCING: "purple",
    OTHER: "gray",
  };
  return m[c] ?? "gray";
};

export default function ExpensesPage() {
  const { data, loading, refetch } = useQuery(EXPENSES_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);

  const [createExpense] = useMutation(CREATE_EXPENSE_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateExpense] = useMutation(UPDATE_EXPENSE_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const expenses: Expense[] = data?.expenses?.data ?? [];
  const projects = projectsData?.projects?.data ?? [];
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, projectId: projects[0]?.id ?? "" });
    setIsModalOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditTarget(e);
    setForm({
      projectId: e.projectId,
      category: e.category,
      description: e.description,
      amount: String(e.amount),
      incurredAt: e.incurredAt,
      receiptUrl: e.receiptUrl ?? "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const common = {
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      incurredAt: form.incurredAt,
      receiptUrl: form.receiptUrl || null,
    };
    if (editTarget) {
      updateExpense({ variables: { id: editTarget.id, input: common } });
    } else {
      createExpense({ variables: { input: { projectId: form.projectId, ...common } } });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("削除しますか？")) return;
    deleteExpense({ variables: { id } });
  };

  const set = (key: keyof ExpenseForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">経費</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {expenses.length} 件 · 合計{" "}
            <span className="font-semibold text-gray-700">
              ¥{totalAmount.toLocaleString()}
            </span>
          </p>
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
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          経費はまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">日付</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">プロジェクト</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">カテゴリ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">内容</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">金額</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{e.incurredAt}</td>
                  <td className="px-4 py-3 text-gray-600">{e.project?.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={categoryVariant(e.category)}>
                      {categoryLabel[e.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ¥{e.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(e)} className="text-gray-500 hover:text-blue-600 text-xs">編集</button>
                      <button onClick={() => handleDelete(e.id)} className="text-gray-500 hover:text-red-600 text-xs">削除</button>
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
        title={editTarget ? "経費を編集" : "経費を追加"}
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
              <select value={form.category} onChange={set("category")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(categoryLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">発生日 *</label>
              <input type="date" value={form.incurredAt} onChange={set("incurredAt")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
            <input type="text" value={form.description} onChange={set("description")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
            <input type="number" value={form.amount} onChange={set("amount")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">領収書URL</label>
            <input type="url" value={form.receiptUrl} onChange={set("receiptUrl")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
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
