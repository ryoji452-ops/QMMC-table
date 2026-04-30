<?php

// app/Models/SPCRItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SPCRItem extends Model
{
    protected $table = 'sprc_items';

    protected $fillable = [
        'sprc_form_id',
        'user_id',              // Direct link to bvflh_users.id
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
        'remarks',
    ];

    protected $casts = [
        'rating_q'   => 'float',
        'rating_e'   => 'float',
        'rating_t'   => 'float',
        'rating_a'   => 'float',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(SPCRForm::class, 'sprc_form_id');
    }

    /**
     * Scope: only items that belong to the currently logged-in employee.
     *
     * Resolution order (matches Controller::currentEmpid()):
     *   1. X-Employee-Id request header  — authoritative (sent by JS apiFetch)
     *   2. session('current_empid')      — fallback for server-side calls
     *
     * Using this scope on the items table directly avoids a JOIN to sprc_forms
     * and is consistent with how forCurrentUser() works on SPCRForm / IPCRForm.
     *
     * Security guarantee: returns an empty result set (1=0) when no empid can
     * be resolved from any source, preventing accidental data leaks.
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
}