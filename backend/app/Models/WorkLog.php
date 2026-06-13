<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 作業ログモデル
 */
class WorkLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'worked_date',
        'hours',
        'description',
        'hourly_rate',
    ];

    protected $casts = [
        'worked_date' => 'date',
        'hours'       => 'float',
        'hourly_rate' => 'float',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
