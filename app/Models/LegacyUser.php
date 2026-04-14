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
        'id', 'l_name', 'f_name', 'm_name',
        'division', 'position', 'name',
    ];

    public function getFullNameAttribute(): ?string
    {
        $last  = trim($this->l_name ?? '');
        $first = trim($this->f_name ?? '');
        $mid   = trim($this->m_name ?? '');

        if ($last && $first && $mid) {
            return strtoupper($last) . ', '
                 . ucfirst(strtolower($first)) . ' '
                 . strtoupper(substr($mid, 0, 1)) . '.';
        }
        if ($last && $first) {
            return strtoupper($last) . ', ' . ucfirst(strtolower($first));
        }
        return $this->name ?? null;
    }

    public function getDivisionLabelAttribute(): ?string
    {
        return $this->division ?? $this->position ?? null;
    }
}