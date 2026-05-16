<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    /**
     * 請求書が属するプロジェクト
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
