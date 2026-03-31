<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegacyUser extends Model
{
    protected $connection = 'mysql_legacy';
    protected $table      = 'bvflh_users';
    protected $primaryKey = 'id';
    public    $timestamps = false;

    protected $fillable = [
        'id',
        'l_name',
        'f_name',
        'm_name',
        'division',
        // legacy fallbacks — kept for backward-compat in case columns differ
        'name',
        'position',
        'section',
    ];

    /**
     * Build a formatted full name from the three name parts.
     *
     * Output format:  LASTNAME, Firstname M.
     * Falls back to the old `name` column if the parts are all empty
     * (handles older rows in the legacy DB that only have `name`).
     *
     * @return string|null
     */
    public function getFullNameAttribute(): ?string
    {
        $last  = trim($this->l_name ?? '');
        $first = trim($this->f_name ?? '');
        $mid   = trim($this->m_name ?? '');

        // All three parts present → "LASTNAME, Firstname M."
        if ($last && $first && $mid) {
            $middleInitial = strtoupper(substr($mid, 0, 1)) . '.';
            return strtoupper($last) . ', ' . ucfirst(strtolower($first)) . ' ' . $middleInitial;
        }

        // Last + first, no middle name
        if ($last && $first) {
            return strtoupper($last) . ', ' . ucfirst(strtolower($first));
        }

        // Only last name (edge case)
        if ($last) {
            return strtoupper($last);
        }

        // Absolute fallback: use the old `name` column if it exists
        return $this->name ?? null;
    }

    /**
     * Return the employee's division/unit.
     *
     * Prefers the `division` column; falls back to `position` or `section`
     * for rows that predate the division column.
     *
     * @return string|null
     */
    public function getDivisionLabelAttribute(): ?string
    {
        return $this->division
            ?? $this->position
            ?? $this->section
            ?? null;
    }
}