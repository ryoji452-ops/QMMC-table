<?php

namespace App\Http\Controllers;

use App\Models\SPCRRatingMatrix;
use App\Models\SPCRForm;
use App\Models\IPCRForm;
use App\Models\LegacyUser;
use Illuminate\Http\Request;

class QmmcController extends Controller
{
    /**
     * Handle the main display.
     * We made $empid optional (= null) so the root URL (/) works.
     */
    public function index($empid = null)
    {
        // 1. If no empid is provided (visiting the home page), 
        // try to find the first employee in the DB to show as a default.
        if (!$empid) {
            $firstUser = LegacyUser::first();
            $empid = $firstUser ? $firstUser->id : null;
            
            // If there are absolutely no users in the DB, show an error or return a blank view.
            if (!$empid) {
                return "No employees found in the database. Please check your connection to 190.190.0.55.";
            }
        }

        // ── Validate empid is numeric ──────────────────────────────────
        if (!is_numeric($empid)) {
            abort(404, 'Invalid employee ID.');
        }

        // ── Store empid in session so API controllers can filter by it ─
        session(['current_empid' => (int) $empid]);

        // ── Fetch employee info from legacy database ───────────────────
        $employeeFullName = null;
        $employeePosition = null;
        $employeeDivision = null;
        $employeeSection  = null;

        try {
            /** @var LegacyUser|null $legacyUser */
            $legacyUser = LegacyUser::find((int) $empid);

            if ($legacyUser) {
                $employeeFullName = $legacyUser->full_name;
                $employeePosition = $legacyUser->position   ?? null;
                $employeeDivision = $legacyUser->division_label;
                $employeeSection  = $legacyUser->section    ?? null;
            } else {
                \Log::info('QmmcController: no employee found for empid=' . $empid);
            }
        } catch (\Exception $e) {
            \Log::warning(
                'QmmcController: legacy DB lookup failed for empid=' . $empid .
                ' — ' . $e->getMessage()
            );
        }

        // ── Static section list ────────────────────────────────────────
        $sections = [
            'ALL SECTIONS',
            'EFMS',
            'IMISS',
            'PMG / EFMS / PROCUREMENT',
            'NURSING',
            'MEDICAL',
            'ADMINISTRATIVE',
            'FINANCE',
            'PHARMACY',
        ];

        // ── Rating Matrix data ─────────────────────────────────────────
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

        // ── Latest DPCR (filtered by current empid) ────────────────────
        $latestDpcrRaw  = SPCRForm::dpcr()->forCurrentUser()->with('items')->latest()->first();
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

        // ── Latest SPCR (filtered by current empid) ────────────────────
        $latestSpcrRaw  = SPCRForm::spcr()->forCurrentUser()->with('items')->latest()->first();
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

        // ── Latest IPCR (filtered by current empid) ────────────────────
        $latestIpcrRaw  = IPCRForm::forCurrentUser()->with('items')->latest()->first();
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
            'latestIpcrJson',
            'empid',
            'employeeFullName',
            'employeePosition',
            'employeeDivision',
            'employeeSection',
        ));
    }
}