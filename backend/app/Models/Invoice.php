<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 請求書モデル
 *
 * プロジェクトに対して発行する請求書を表す
 */
class Invoice extends Model
{
    use HasFactory;

    /**
     * 一括代入可能なカラム
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'project_id',
        'invoice_number',
        'status',
        'amount',
        'tax_rate',
        'issued_at',
        'due_at',
        'paid_at',
        'notes',
        'tax_amount',
        'total_amount',
    ];

    /**
     * 型キャスト設定
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount'       => 'float',
        'tax_rate'     => 'float',
        'tax_amount'   => 'float',
        'total_amount' => 'float',
        'issued_at'    => 'date',
        'due_at'       => 'date',
        'paid_at'      => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $year = now()->format('Y');
                $count = self::whereYear('created_at', $year)->count() + 1;
                $invoice->invoice_number = sprintf('INV-%s-%04d', $year, $count);
            }
            if (empty($invoice->status)) {
                $invoice->status = 'draft';
            }
            $taxRate = $invoice->tax_rate ?? 10;
            $invoice->tax_amount = round($invoice->amount * $taxRate / 100);
            $invoice->total_amount = $invoice->amount + $invoice->tax_amount;
        });

        static::updating(function (Invoice $invoice) {
            if ($invoice->isDirty(['amount', 'tax_rate'])) {
                $taxRate = $invoice->tax_rate ?? 10;
                $invoice->tax_amount = round($invoice->amount * $taxRate / 100);
                $invoice->total_amount = $invoice->amount + $invoice->tax_amount;
            }
        });
    }

    /**
     * 請求書が属するプロジェクト
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * 請求書に紐づく明細一覧
     */
    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }
}
