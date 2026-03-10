<?php

// app/Models/IPCRItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IPCRItem extends Model
{
    use HasFactory;

    protected $table = 'ipcr_items';

    protected $fillable = [
        'ipcr_form_id',
        'sort_order',
        'function_type',
        'strategic_goal',
        'performance_indicator',
        'actual_accomplishment',
        'accomplishment_rate',
        'rating_q',
        'rating_e',
        'rating_t',
        'rating_a',
        'remarks',
    ];

    protected $casts = [
        'rating_q'   => 'float',
        'rating_e'   => 'float',
        'rating_t'   => 'float',
        'rating_a'   => 'float',
        'sort_order' => 'integer',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(IPCRForm::class, 'ipcr_form_id');
    }
}