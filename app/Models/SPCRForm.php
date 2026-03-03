<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'signed_date'
    ];

    public function items()
    {
        return $this->hasMany(SPCRItem::class, 'sprc_form_id');
    }
}