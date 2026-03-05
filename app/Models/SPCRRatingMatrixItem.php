<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SPCRRatingMatrixItem extends Model
{
    protected $table = 'spcr_rating_matrices';

    protected $fillable = [
        'matrix_id',
        'is_section', 'section_label',
        'performance_measure', 'operational_definition',
        'quality', 'efficiency', 'timeliness',
        'source_monitoring', 'sort_order',
    ];

    protected $casts = [
        'is_section' => 'boolean',
    ];

    public function matrix()
    {
        return $this->belongsTo(SPCRRatingMatrix::class, 'matrix_id');
    }
}