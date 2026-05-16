<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * プロジェクトモデル
 *
 * クライアントから受注したプロジェクトを表す
 */
class Project extends Model
{
    use HasFactory;

    /**
     * 一括代入可能なカラム
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_id',
        'name',
        'description',
        'status',
        'start_date',
        'end_date',
        'hourly_rate',
    ];

    /**
     * 型キャスト設定
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'hourly_rate' => 'float',
    ];

    /**
     * プロジェクトが属するクライアント
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * プロジェクトに紐づく請求書一覧
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
