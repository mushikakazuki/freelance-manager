"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import {
  INVOICES_QUERY,
  CREATE_INVOICE_MUTATION,
  UPDATE_INVOICE_MUTATION,
  DELETE_INVOICE_MUTATION,
} from "@/lib/graphql/invoices";
import { PROJECTS_QUERY } from "@/lib/graphql/projects";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

type Invoice = {
  id: string;
  projectId: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  notes: string | null;
  project: { id: string; name: string; client: { id: string; name: string } };
};

type InvoiceForm = {
  projectId: string;
  amount: string;
  taxRate: string;
  issuedAt: string;
  dueAt: string;
  notes: string;
  status: string;
};

const emptyForm: InvoiceForm = {
  projectId: "",
  amount: "",
  taxRate: "10",
  issuedAt: "",
  dueAt: "",
  notes: "",
  status: "DRAFT",
};

const statusLabel: Record<string, string> = {
  DRAFT: "下書き",
  SENT: "送付済",
  PAID: "支払済",
  OVERDUE: "期限超過",
  CANCELLED: "キャンセル",
};
const statusVariant = (
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

export default function InvoicesPage() {
  const { data, loading, refetch } = useQuery(INVOICES_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);

  const [createInvoice] = useMutation(CREATE_INVOICE_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateInvoice] = useMutation(UPDATE_INVOICE_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteInvoice] = useMutation(DELETE_INVOICE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const invoices: Invoice[] = data?.invoices?.data ?? [];
  const projects = projectsData?.projects?.data ?? [];

  const openNew = () => {
    setEditTarget(null);
    setIsEditModal(false);
    setForm({ ...emptyForm, projectId: projects[0]?.id ?? "" });
    setIsModalOpen(true);
  };
  const openEdit = (i: Invoice) => {
    setEditTarget(i);
    setIsEditModal(true);
    setForm({
      projectId: i.projectId,
      amount: String(i.amount),
      taxRate: String(i.taxRate),
      issuedAt: i.issuedAt ?? "",
      dueAt: i.dueAt ?? "",
      notes: i.notes ?? "",
      status: i.status,
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditModal && editTarget) {
      updateInvoice({
        variables: {
          id: editTarget.id,
          input: {
            amount: parseFloat(form.amount),
            taxRate: parseFloat(form.taxRate),
            status: form.status,
            issuedAt: form.issuedAt || null,
            dueAt: form.dueAt || null,
            notes: form.notes || null,
          },
        },
      });
    } else {
      createInvoice({
        variables: {
          input: {
            projectId: form.projectId,
            amount: parseFloat(form.amount),
            taxRate: parseFloat(form.taxRate),
            issuedAt: form.issuedAt || null,
            dueAt: form.dueAt || null,
            notes: form.notes || null,
          },
        },
      });
    }
  };

  const handleDelete = (id: string, num: string) => {
    if (!confirm(`請求書「${num}」を削除しますか？`)) return;
    deleteInvoice({ variables: { id } });
  };

  const set = (key: keyof InvoiceForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const totalUnpaid = invoices
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">請求書</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {invoices.length} 件 ·未払い合計:{" "}
            <span className="font-semibold text-gray-700">
              ¥{totalUnpaid.toLocaleString()}
            </span>
          </p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 作成
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          請求書はまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">請求書番号</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">クライアント</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">プロジェクト</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">金額</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">期限</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/invoices/${i.id}`} className="font-medium text-blue-600 hover:underline">
                      {i.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{i.project?.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{i.project?.name}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ¥{i.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(i.status)}>
                      {statusLabel[i.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{i.dueAt ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(i)} className="text-gray-500 hover:text-blue-600 text-xs">編集</button>
                      <button onClick={() => handleDelete(i.id, i.invoiceNumber)} className="text-gray-500 hover:text-red-600 text-xs">削除</button>
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
        title={isEditModal ? "請求書を編集" : "請求書を作成"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isEditModal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト *</label>
              <select
                value={form.projectId}
                onChange={set("projectId")}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {projects.map((p: { id: string; name: string; client: { name: string } }) => (
                  <option key={p.id} value={p.id}>
                    {p.client?.name} — {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isEditModal && (
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
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
              <input type="number" value={form.amount} onChange={set("amount")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="100000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">消費税率（%）</label>
              <input type="number" value={form.taxRate} onChange={set("taxRate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">発行日</label>
              <input type="date" value={form.issuedAt} onChange={set("issuedAt")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">支払期限</label>
              <input type="date" value={form.dueAt} onChange={set("dueAt")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {form.amount && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>小計</span>
                <span>¥{parseFloat(form.amount || "0").toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>消費税（{form.taxRate}%）</span>
                <span>¥{Math.round(parseFloat(form.amount || "0") * parseFloat(form.taxRate || "0") / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 mt-1 pt-1 border-t border-gray-200">
                <span>合計</span>
                <span>¥{Math.round(parseFloat(form.amount || "0") * (1 + parseFloat(form.taxRate || "0") / 100)).toLocaleString()}</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {isEditModal ? "更新" : "作成"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
