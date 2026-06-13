<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 経費モデル
 */
class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'category',
        'description',
        'amount',
        'incurred_at',
        'receipt_url',
    ];

    protected $casts = [
        'amount'      => 'float',
        'incurred_at' => 'date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
