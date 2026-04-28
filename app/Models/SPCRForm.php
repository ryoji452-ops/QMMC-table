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
     *
     * Resolution order (matches Controller::currentEmpid()):
     *   1. X-Employee-Id request header — authoritative; sent by JS apiFetch()
     *      on every API call and always reflects the real window.EMPID.
     *   2. session('current_empid') — fallback for server-side page-load queries.
     *
     * The header takes priority so that a stale/wrong session (e.g. set by a
     * root-URL visit that defaulted to LegacyUser::first()) never causes the
     * wrong employee's records to be returned.
     */
    public function scopeForCurrentUser($query)
    {
        $fromHeader = request()->header('X-Employee-Id');

        // Header is authoritative — prefer it and correct the session if needed.
        if ($fromHeader && is_numeric($fromHeader)) {
            $empid = (int) $fromHeader;
            if ((int) session('current_empid') !== $empid) {
                session(['current_empid' => $empid]);
            }
            return $query->where('user_id', $empid);
        }

        // Fall back to session for server-side (non-AJAX) use.
        $empid = session('current_empid');
        if ($empid && is_numeric($empid)) {
            return $query->where('user_id', (int) $empid);
        }

        // No empid from any source — return nothing so no data leaks.
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