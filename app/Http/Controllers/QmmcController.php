<?php

// app/Http/Controllers/QmmcController.php

namespace App\Http\Controllers;

use App\Models\SPCRRatingMatrix;
use App\Models\SPCRForm;
use App\Models\IPCRForm;
use Illuminate\Http\Request;

class QmmcController extends Controller
{
    public function index()
    {
        $sections = [
            'ALL SECTIONS', 'EFMS', 'IMISS', 'PMG / EFMS / PROCUREMENT',
            'NURSING', 'MEDICAL', 'ADMINISTRATIVE', 'FINANCE', 'PHARMACY',
        ];

        // Saved Matrices list for the bottom table
        $matricesRaw  = SPCRRatingMatrix::latest()->get();
        $matricesJson = $matricesRaw->map(function ($m) {
            return [
                'id'                => $m->id,
                'prepared_by'       => $m->prepared_by,
                'prepared_by_title' => $m->prepared_by_title,
                'reviewed_by'       => $m->reviewed_by,
                'approved_by'       => $m->approved_by,
                'saved_at'          => $m->created_at->format('m/d/Y, h:i:s A'),
            ];
        })->values()->toArray();

        // Latest SPCR Rating Matrix to pre-fill the Rating Matrix form
        $latestMatrixRaw  = SPCRRatingMatrix::with('items')->latest()->first();
        $latestMatrixJson = null;
        if ($latestMatrixRaw) {
            $latestMatrixJson = [
                'prepared_by'       => $latestMatrixRaw->prepared_by,
                'prepared_by_title' => $latestMatrixRaw->prepared_by_title,
                'reviewed_by'       => $latestMatrixRaw->reviewed_by,
                'reviewed_by_title' => $latestMatrixRaw->reviewed_by_title,
                'approved_by'       => $latestMatrixRaw->approved_by,
                'approved_by_title' => $latestMatrixRaw->approved_by_title,
                'items'             => $latestMatrixRaw->items->map(function ($i) {
                    return [
                        'type'                   => $i->is_section ? 'section' : 'data',
                        'section_label'          => $i->section_label,
                        'performance_measure'    => $i->performance_measure,
                        'operational_definition' => $i->operational_definition,
                        'quality'                => $i->quality,
                        'efficiency'             => $i->efficiency,
                        'timeliness'             => $i->timeliness,
                        'source_monitoring'      => $i->source_monitoring,
                    ];
                })->values()->toArray(),
            ];
        }

        // Latest DPCR form (form_type = 'dpcr') to pre-fill the DPCR tab
        $latestDpcrRaw  = SPCRForm::dpcr()->with('items')->latest()->first();
        $latestDpcrJson = null;
        if ($latestDpcrRaw) {
            $latestDpcrJson = [
                'employee_name'  => $latestDpcrRaw->employee_name,
                'employee_title' => $latestDpcrRaw->employee_title,
                'approved_by'    => $latestDpcrRaw->approved_by,
                'items'          => $latestDpcrRaw->items->map(function ($i) {
                    return [
                        'function_type'         => $i->function_type,
                        'strategic_goal'        => $i->strategic_goal,
                        'performance_indicator' => $i->performance_indicator,
                        'target_pct'            => $i->target_pct,
                        'allotted_budget'       => $i->allotted_budget,
                        'section_accountable'   => $i->section_accountable,
                        'actual_accomplishment' => $i->actual_accomplishment,
                        'actual_pct'            => $i->actual_pct,
                        'accomplishment_rate'   => $i->accomplishment_rate,
                        'rating_q'              => $i->rating_q,
                        'rating_e'              => $i->rating_e,
                        'rating_t'              => $i->rating_t,
                        'rating_a'              => $i->rating_a,
                        'remarks'               => $i->remarks,
                    ];
                })->values()->toArray(),
            ];
        }

        // Latest SPCR form (form_type = 'spcr') to pre-fill the SPCR tab
        $latestSpcrRaw  = SPCRForm::spcr()->with('items')->latest()->first();
        $latestSpcrJson = null;
        if ($latestSpcrRaw) {
            $latestSpcrJson = [
                'employee_name'     => $latestSpcrRaw->employee_name,
                'employee_position' => $latestSpcrRaw->employee_title,
                'employee_unit'     => $latestSpcrRaw->division,
                'period'            => $latestSpcrRaw->area,
                'approved_by'       => $latestSpcrRaw->approved_by,
                'items'             => $latestSpcrRaw->items->map(function ($i) {
                    return [
                        'is_section'            => false,
                        'function_type'         => $i->function_type,
                        'strategic_goal'        => $i->strategic_goal,
                        'performance_indicator' => $i->performance_indicator,
                        'allotted_budget'       => $i->allotted_budget,
                        'person_accountable'    => $i->section_accountable,
                        'actual_accomplishment' => $i->actual_accomplishment,
                        'accomplishment_rate'   => $i->accomplishment_rate,
                        'rating_q'              => $i->rating_q,
                        'rating_e'              => $i->rating_e,
                        'rating_t'              => $i->rating_t,
                        'rating_a'              => $i->rating_a,
                        'remarks'               => $i->remarks,
                    ];
                })->values()->toArray(),
            ];
        }

        // Latest IPCR form to pre-fill the IPCR tab
        $latestIpcrRaw  = IPCRForm::with('items')->latest()->first();
        $latestIpcrJson = null;
        if ($latestIpcrRaw) {
            $latestIpcrJson = [
                'employee_name'     => $latestIpcrRaw->employee_name,
                'employee_position' => $latestIpcrRaw->employee_position,
                'employee_unit'     => $latestIpcrRaw->employee_unit,
                'period'            => $latestIpcrRaw->period,
                'supervisor'        => $latestIpcrRaw->supervisor,
                'approved_by'       => $latestIpcrRaw->approved_by,
                'recommending'      => $latestIpcrRaw->recommending,
                'pct_core'          => $latestIpcrRaw->pct_core,
                'pct_support'       => $latestIpcrRaw->pct_support,
                'avg_core'          => $latestIpcrRaw->avg_core,
                'avg_support'       => $latestIpcrRaw->avg_support,
                'items'             => $latestIpcrRaw->items->map(function ($i) {
                    return [
                        'function_type'         => $i->function_type,
                        'strategic_goal'        => $i->strategic_goal,
                        'performance_indicator' => $i->performance_indicator,
                        'actual_accomplishment' => $i->actual_accomplishment,
                        'accomplishment_rate'   => $i->accomplishment_rate,
                        'rating_q'              => $i->rating_q,
                        'rating_e'              => $i->rating_e,
                        'rating_t'              => $i->rating_t,
                        'rating_a'              => $i->rating_a,
                        'remarks'               => $i->remarks,
                    ];
                })->values()->toArray(),
            ];
        }

        return view('qmmc.index', compact(
            'sections',
            'matricesJson',
            'latestMatrixJson',
            'latestDpcrJson',
            'latestSpcrJson',
            'latestIpcrJson'
        ));
    }
}