<?php

// app/Models/SPCRForm.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SPCRForm extends Model
{
    protected $table = 'sprc_forms';

    protected $fillable = [
        'employee_name',
        'employee_title',
        'division',
        'area',
        'year',
        'semester',
        'approved_by',
        'approved_by_title',
        'signed_date',
    ];

    protected $casts = [
        'signed_date' => 'date',
        'year'        => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(SPCRItem::class, 'sprc_form_id');
    }
}