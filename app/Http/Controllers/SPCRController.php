<?php

// app/Http/Controllers/SPCRController.php

namespace App\Http\Controllers;

use App\Models\SPCRForm;
use App\Models\SPCRItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SPCRController extends Controller
{
    /**
     * Return all DPCR forms as JSON.
     */
    public function index(): JsonResponse
    {
        $forms = SPCRForm::with('items')->latest()->get();
        return response()->json($forms);
    }

    /**
     * Save a new DPCR form + its items.
     * Called via JS fetch POST /api/dpcr
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_name'                  => 'required|string|max:255',
            'employee_title'                 => 'nullable|string|max:255',
            'division'                       => 'required|string|max:255',
            'area'                           => 'required|string|max:255',
            'year'                           => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'semester'                       => 'required|in:1st,2nd',
            'approved_by'                    => 'nullable|string|max:255',
            'approved_by_title'              => 'nullable|string|max:255',
            'signed_date'                    => 'nullable|date',
            'items'                          => 'required|array|min:1',
            'items.*.function_type'          => 'required|in:Strategic,Core,Support',
            'items.*.strategic_goal'         => 'required|string',
            'items.*.performance_indicator'  => 'required|string',
            'items.*.allotted_budget'        => 'nullable|string|max:255',
            'items.*.section_accountable'    => 'required|string|max:255',
            'items.*.actual_accomplishment'  => 'nullable|string',
            'items.*.accomplishment_rate'    => 'nullable|string|max:50',
            'items.*.rating_q'               => 'nullable|boolean',
            'items.*.rating_e'               => 'nullable|boolean',
            'items.*.rating_t'               => 'nullable|boolean',
            'items.*.rating_a'               => 'nullable|boolean',
            'items.*.remarks'                => 'nullable|string',
        ]);

        $form = SPCRForm::create([
            'employee_name'     => $validated['employee_name'],
            'employee_title'    => $validated['employee_title'] ?? null,
            'division'          => $validated['division'],
            'area'              => $validated['area'],
            'year'              => $validated['year'],
            'semester'          => $validated['semester'],
            'approved_by'       => $validated['approved_by'] ?? null,
            'approved_by_title' => $validated['approved_by_title'] ?? null,
            'signed_date'       => $validated['signed_date'] ?? null,
        ]);

        foreach ($validated['items'] as $itemData) {
            SPCRItem::create([
                'sprc_form_id'          => $form->id,
                'function_type'         => $itemData['function_type'],
                'strategic_goal'        => $itemData['strategic_goal'],
                'performance_indicator' => $itemData['performance_indicator'],
                'allotted_budget'       => $itemData['allotted_budget'] ?? null,
                'section_accountable'   => $itemData['section_accountable'],
                'actual_accomplishment' => $itemData['actual_accomplishment'] ?? null,
                'accomplishment_rate'   => $itemData['accomplishment_rate'] ?? null,
                'rating_q'              => $itemData['rating_q'] ?? false,
                'rating_e'              => $itemData['rating_e'] ?? false,
                'rating_t'              => $itemData['rating_t'] ?? false,
                'rating_a'              => $itemData['rating_a'] ?? false,
                'remarks'               => $itemData['remarks'] ?? null,
            ]);
        }

        $form->load('items');

        return response()->json([
            'success' => true,
            'message' => 'DPCR saved successfully.',
            'form'    => $form,
        ], 201);
    }
}