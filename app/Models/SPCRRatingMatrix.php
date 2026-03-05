<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class SPCRRatingMatrix extends Model
{
    protected $table = 'spcr_rating_matrices';   

    protected $fillable = [
        'prepared_by', 'prepared_by_title',
        'reviewed_by', 'reviewed_by_title',
        'approved_by', 'approved_by_title',
        'prepared_date', 'reviewed_date', 'approved_date',
    ];
    protected $casts = [
        'prepared_date' => 'date',
        'reviewed_date' => 'date',
        'approved_date' => 'date',
    ];
    public function items()
    {
        return $this->hasMany(SPCRRatingMatrixItem::class, 'matrix_id')->orderBy('sort_order');
    }
}