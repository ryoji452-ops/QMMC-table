<?php

// app/Models/SPCRRatingMatrixItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SPCRRatingMatrixItem extends Model
{
    protected $table = 'spcr_rating_matrix_items';

    protected $fillable = [
        'matrix_id',
        'is_section',
        'section_label',
        'performance_measure',
        'operational_definition',
        'quality',
        'efficiency',
        'timeliness',
        'source_monitoring',
        'sort_order',
    ];

    protected $casts = [
        'is_section'  => 'boolean',
        'sort_order'  => 'integer',
    ];

    public function matrix(): BelongsTo
    {
        return $this->belongsTo(SPCRRatingMatrix::class, 'matrix_id');
    }
}