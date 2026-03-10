<?php

// app/Models/IPCRForm.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IPCRForm extends Model
{
    use HasFactory;

    protected $table = 'ipcr_forms';

    protected $fillable = [
        'employee_name',
        'employee_position',
        'employee_unit',
        'period',
        'supervisor',
        'approved_by',
        'recommending',
        'year',
        'semester',
        'pct_core',
        'pct_support',
        'avg_core',
        'avg_support',
        'final_avg',
        'adjectival_rating',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(IPCRItem::class, 'ipcr_form_id')->orderBy('sort_order');
    }
}
