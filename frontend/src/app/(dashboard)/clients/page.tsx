"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import {
  CLIENTS_QUERY,
  CREATE_CLIENT_MUTATION,
  DELETE_CLIENT_MUTATION,
  UPDATE_CLIENT_MUTATION,
} from "@/lib/graphql/clients";
import { Modal } from "@/components/ui/Modal";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
};

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const emptyForm: ClientForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function ClientsPage() {
  const { data, loading, refetch } = useQuery(CLIENTS_QUERY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);

  const [createClient] = useMutation(CREATE_CLIENT_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [updateClient] = useMutation(UPDATE_CLIENT_MUTATION, {
    onCompleted: () => { refetch(); closeModal(); },
  });
  const [deleteClient] = useMutation(DELETE_CLIENT_MUTATION, {
    onCompleted: () => refetch(),
  });

  const clients: Client[] = data?.clients?.data ?? [];

  const openNew = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditTarget(client);
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      notes: form.notes || null,
    };
    if (editTarget) {
      updateClient({ variables: { id: editTarget.id, input } });
    } else {
      createClient({ variables: { input } });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    deleteClient({ variables: { id } });
  };

  const field = (key: keyof ClientForm, label: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">クライアント</h2>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} 件</p>
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
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          クライアントがまだいません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-600">名前</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">メール</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">電話</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-blue-600 text-xs">編集</button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="text-gray-500 hover:text-red-600 text-xs">削除</button>
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
        title={editTarget ? "クライアントを編集" : "クライアントを追加"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {field("name", "名前 *")}
          {field("email", "メールアドレス", "email")}
          {field("phone", "電話番号")}
          {field("address", "住所")}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              キャンセル
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {editTarget ? "更新" : "作成"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
