"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  CONTRACTS_QUERY,
  CREATE_CONTRACT_MUTATION,
  UPDATE_CONTRACT_MUTATION,
  DELETE_CONTRACT_MUTATION,
} from "@/lib/graphql/contracts";
import { CLIENTS_QUERY } from "@/lib/graphql/clients";
import { PROJECTS_QUERY } from "@/lib/graphql/projects";
import { Modal } from "@/components/ui/Modal";

type Contract = {
  id: string;
  clientId: string;
  projectId: string | null;
  title: string;
  hourlyRate: number | null;
  monthlyRate: number | null;
  paymentTerms: number | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  client: { id: string; name: string };
  project: { id: string; name: string } | null;
};

type ContractForm = {
  clientId: string;
  projectId: string;
  title: string;
  hourlyRate: string;
  monthlyRate: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  notes: string;
};

const emptyForm: ContractForm = {
  clientId: "",
  projectId: "",
  title: "",
  hourlyRate: "",
  monthlyRate: "",
  paymentTerms: "30",
  startDate: "",
  endDate: "",
  notes: "",
};

export default function ContractsPage() {
  const { data, loading, refetch } = useQuery(CONTRACTS_QUERY);
  const { data: clientsData } = useQuery(CLIENTS_QUERY);
  const { data: projectsData } = useQuery(PROJECTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Contract | null>(null);
  const [form, setForm] = useState<ContractForm>(emptyForm);

  const [createContract] = useMutation(CREATE_CONTRACT_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateContract] = useMutation(UPDATE_CONTRACT_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteContract] = useMutation(DELETE_CONTRACT_MUTATION, {
    onCompleted: () => refetch(),
  });

  const contracts: Contract[] = data?.contracts?.data ?? [];
  const clients = clientsData?.clients?.data ?? [];
  const projects = projectsData?.projects?.data ?? [];

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, clientId: clients[0]?.id ?? "" });
    setIsModalOpen(true);
  };
  const openEdit = (c: Contract) => {
    setEditTarget(c);
    setForm({
      clientId: c.clientId,
      projectId: c.projectId ?? "",
      title: c.title,
      hourlyRate: c.hourlyRate != null ? String(c.hourlyRate) : "",
      monthlyRate: c.monthlyRate != null ? String(c.monthlyRate) : "",
      paymentTerms: c.paymentTerms != null ? String(c.paymentTerms) : "30",
      startDate: c.startDate,
      endDate: c.endDate ?? "",
      notes: c.notes ?? "",
    });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };

  const buildInput = () => ({
    projectId: form.projectId || null,
    title: form.title,
    hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
    monthlyRate: form.monthlyRate ? parseFloat(form.monthlyRate) : null,
    paymentTerms: form.paymentTerms ? parseInt(form.paymentTerms) : null,
    startDate: form.startDate,
    endDate: form.endDate || null,
    notes: form.notes || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      updateContract({ variables: { id: editTarget.id, input: buildInput() } });
    } else {
      createContract({ variables: { input: { clientId: form.clientId, ...buildInput() } } });
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    deleteContract({ variables: { id } });
  };

  const set = (key: keyof ContractForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const filteredProjects = projects.filter(
    (p: { clientId: string }) => !form.clientId || p.clientId === form.clientId
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">契約</h2>
          <p className="text-sm text-gray-500 mt-0.5">{contracts.length} 件</p>
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
      ) : contracts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          契約はまだありません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">タイトル</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">クライアント</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">プロジェクト</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">単価</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">期間</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">支払サイト</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600">{c.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.project?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.hourlyRate != null && `¥${c.hourlyRate.toLocaleString()}/h`}
                    {c.monthlyRate != null && `¥${c.monthlyRate.toLocaleString()}/月`}
                    {c.hourlyRate == null && c.monthlyRate == null && "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {c.startDate} 〜 {c.endDate ?? "継続中"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.paymentTerms != null ? `${c.paymentTerms}日` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-blue-600 text-xs">編集</button>
                      <button onClick={() => handleDelete(c.id, c.title)} className="text-gray-500 hover:text-red-600 text-xs">削除</button>
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
        title={editTarget ? "契約を編集" : "契約を追加"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {!editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">クライアント *</label>
              <select value={form.clientId} onChange={set("clientId")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">選択してください</option>
                {clients.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト（任意）</label>
            <select value={form.projectId} onChange={set("projectId")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">なし</option>
              {filteredProjects.map((p: { id: string; name: string }) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
            <input type="text" value={form.title} onChange={set("title")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間単価（円）</label>
              <input type="number" value={form.hourlyRate} onChange={set("hourlyRate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月額単価（円）</label>
              <input type="number" value={form.monthlyRate} onChange={set("monthlyRate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">支払サイト（日）</label>
            <input type="number" value={form.paymentTerms} onChange={set("paymentTerms")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="30" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日 *</label>
              <input type="date" value={form.startDate} onChange={set("startDate")} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input type="date" value={form.endDate} onChange={set("endDate")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea value={form.notes} onChange={set("notes")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
