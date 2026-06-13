<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 契約モデル
 */
class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'project_id',
        'title',
        'hourly_rate',
        'monthly_rate',
        'payment_terms',
        'start_date',
        'end_date',
        'notes',
    ];

    protected $casts = [
        'hourly_rate'   => 'float',
        'monthly_rate'  => 'float',
        'start_date'    => 'date',
        'end_date'      => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
