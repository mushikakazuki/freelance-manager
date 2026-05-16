<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * クライアント（顧客）モデル
 *
 * フリーランサーが管理する顧客情報を表す
 */
class Client extends Model
{
    use HasFactory;

    /**
     * 一括代入可能なカラム
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'address',
        'notes',
    ];

    /**
     * クライアントを所有するユーザー
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * クライアントに紐づくプロジェクト一覧
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
