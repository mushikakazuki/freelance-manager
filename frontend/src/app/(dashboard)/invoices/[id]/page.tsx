"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { INVOICE_QUERY } from "@/lib/graphql/invoices";
import { Badge } from "@/components/ui/Badge";

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

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useQuery(INVOICE_QUERY, { variables: { id } });

  if (loading)
    return <div className="p-6 text-center text-gray-400">読み込み中...</div>;

  const invoice = data?.invoice;
  if (!invoice)
    return (
      <div className="p-6 text-center text-gray-400">
        請求書が見つかりません
      </div>
    );

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <Link
          href="/invoices"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 請求書一覧
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {invoice.project?.client?.name} — {invoice.project?.name}
            </p>
          </div>
          <Badge variant={statusVariant(invoice.status)}>
            {statusLabel[invoice.status]}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div>
            <dt className="text-gray-500">発行日</dt>
            <dd className="font-medium">{invoice.issuedAt ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">支払期限</dt>
            <dd className="font-medium">{invoice.dueAt ?? "—"}</dd>
          </div>
          {invoice.paidAt && (
            <div>
              <dt className="text-gray-500">支払日</dt>
              <dd className="font-medium">{invoice.paidAt}</dd>
            </div>
          )}
          {invoice.notes && (
            <div className="col-span-2">
              <dt className="text-gray-500">備考</dt>
              <dd className="font-medium whitespace-pre-wrap">{invoice.notes}</dd>
            </div>
          )}
        </dl>

        {/* 明細 */}
        {invoice.invoiceItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">明細</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">内容</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">数量</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">単価</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoiceItems.map(
                    (item: {
                      id: string;
                      description: string | null;
                      quantity: number;
                      unitPrice: number;
                      amount: number;
                    }) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2 text-gray-900">{item.description ?? "—"}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-600">¥{item.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">¥{item.amount.toLocaleString()}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 金額サマリー */}
        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>小計</span>
            <span>¥{invoice.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>消費税（{invoice.taxRate}%）</span>
            <span>¥{invoice.taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
            <span>合計</span>
            <span>¥{invoice.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
