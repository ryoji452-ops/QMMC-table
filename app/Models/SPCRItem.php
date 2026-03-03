<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SPCRItem extends Model
{
    protected $table = 'sprc_items';

    protected $fillable = [
        'sprc_form_id',
        'function_type',
        'strategic_goal',
        'performance_indicator',
        'allotted_budget',
        'section_accountable',
        'actual_accomplishment',
        'accomplishment_rate',
        'rating_q',
        'rating_e',
        'rating_t',
        'rating_a',
        'remarks'
    ];

    protected $casts = [
        'rating_q' => 'boolean',
        'rating_e' => 'boolean',
        'rating_t' => 'boolean',
        'rating_a' => 'boolean',
    ];

    public function spcrForm()
    {
        return $this->belongsTo(SPCRForm::class);
    }
}