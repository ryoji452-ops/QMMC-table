<?php

// app/Models/SPCRForm.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SPCRForm extends Model
{
    protected $table = 'sprc_forms';

    protected $fillable = [
        'form_type',        // ← 'dpcr' or 'spcr'
        'user_id',
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

    /* ── Scopes ── */

    /**
     * Filter records belonging to the currently logged-in employee.
     * Uses session('current_empid') set by QmmcController when the
     * page is loaded — this app does not use Laravel Auth.
     */
    public function scopeForCurrentUser($query)
    {
        $empid = session('current_empid');
        if ($empid) {
            return $query->where('user_id', (int) $empid);
        }
        // No session empid — return nothing so no data leaks
        return $query->whereRaw('1 = 0');
    }

    public function scopeDpcr($query)
    {
        return $query->where('form_type', 'dpcr');
    }

    public function scopeSpcr($query)
    {
        return $query->where('form_type', 'spcr');
    }
}