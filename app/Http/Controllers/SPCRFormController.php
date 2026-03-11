<?php

// app/Http/Controllers/SPCRFormController.php

namespace App\Http\Controllers;

use App\Models\SPCRForm;
use App\Models\SPCRItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SPCRFormController extends Controller
{
    /**
     * Return all SPCR forms as JSON.
     */
    public function index(): JsonResponse
    {
        $forms = SPCRForm::with('items')->latest()->get();
        return response()->json($forms);
    }

    /**
     * Save a new SPCR form + its items.
     * Called via JS fetch POST /api/spcr
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_name'                  => 'required|string|max:255',
            'employee_position'              => 'nullable|string|max:255',
            'employee_unit'                  => 'nullable|string|max:255',
            'period'                         => 'nullable|string|max:255',
            'supervisor'                     => 'nullable|string|max:255',
            'approved_by'                    => 'nullable|string|max:255',
            'year'                           => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'semester'                       => 'required|in:1st,2nd',
            'items'                          => 'required|array|min:1',
            'items.*.is_section'             => 'sometimes|nullable|boolean',
            'items.*.section_label'          => 'sometimes|nullable|string|max:255',
            'items.*.function_type'          => 'sometimes|nullable|in:Strategic,Core,Support',
            'items.*.strategic_goal'         => 'sometimes|nullable|string',
            'items.*.performance_indicator'  => 'sometimes|nullable|string',
            'items.*.target_text'            => 'sometimes|nullable|string',
            'items.*.target_pct'             => 'sometimes|nullable|integer|min:0|max:100',
            'items.*.allotted_budget'        => 'sometimes|nullable|string|max:255',
            'items.*.person_accountable'     => 'sometimes|nullable|string|max:255',
            'items.*.actual_accomplishment'  => 'sometimes|nullable|string',
            'items.*.accomplishment_rate'    => 'sometimes|nullable|string|max:50',
            'items.*.remarks'                => 'sometimes|nullable|string',
        ]);

        $form = SPCRForm::create([
            'employee_name'  => $validated['employee_name'],
            'employee_title' => $validated['employee_position'] ?? null,
            'division'       => $validated['employee_unit']     ?? '—',
            'area'           => $validated['period']            ?? '—',
            'year'           => $validated['year'],
            'semester'       => $validated['semester'],
            'approved_by'    => $validated['approved_by']       ?? null,
        ]);

        foreach ($validated['items'] as $itemData) {
            // Skip section-header rows — they are UI artefacts only
            if (!empty($itemData['is_section'])) continue;

            SPCRItem::create([
                'sprc_form_id'          => $form->id,
                'function_type'         => $itemData['function_type']         ?? 'Strategic',
                'strategic_goal'        => $itemData['strategic_goal']        ?? '',
                'performance_indicator' => $itemData['performance_indicator'] ?? '',
                'target_text'           => $itemData['target_text']           ?? null,
                'target_pct'            => isset($itemData['target_pct']) ? (int)$itemData['target_pct'] : null,
                'allotted_budget'       => $itemData['allotted_budget']       ?? null,
                'section_accountable'   => $itemData['person_accountable']    ?? 'ALL SECTIONS',
                'actual_accomplishment' => $itemData['actual_accomplishment'] ?? null,
                'accomplishment_rate'   => $itemData['accomplishment_rate']   ?? null,
                'rating_q'              => false,
                'rating_e'              => false,
                'rating_t'              => false,
                'rating_a'              => false,
                'remarks'               => $itemData['remarks']               ?? null,
            ]);
        }

        $form->load('items');

        return response()->json([
            'success' => true,
            'message' => 'SPCR form saved successfully.',
            'form'    => $form,
        ], 201);
    }

    /**
     * Return a single SPCR form with its items.
     * GET /api/spcr/{form}
     */
    public function show(SPCRForm $form): JsonResponse
    {
        $form->load('items');
        return response()->json($form);
    }

    /**
     * Delete an SPCR form and its items.
     */
    public function destroy(SPCRForm $form): JsonResponse
    {
        $form->items()->delete();
        $form->delete();
        return response()->json(['success' => true, 'message' => 'SPCR form deleted.']);
    }
}