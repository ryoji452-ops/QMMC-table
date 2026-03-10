<?php

// app/Http/Controllers/IPCRController.php

namespace App\Http\Controllers;

use App\Models\IPCRForm;
use App\Models\IPCRItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IPCRController extends Controller
{
    /**
     * Return all IPCR forms as JSON.
     * GET /api/ipcr
     */
    public function index(): JsonResponse
    {
        $forms = IPCRForm::with('items')->latest()->get();
        return response()->json($forms);
    }

    /**
     * Return a single IPCR form with its items.
     * GET /api/ipcr/{form}
     */
    public function show(IPCRForm $form): JsonResponse
    {
        $form->load('items');
        return response()->json($form);
    }

    /**
     * Save a new IPCR form + its items.
     * POST /api/ipcr
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
            'recommending'                   => 'nullable|string|max:255',
            'year'                           => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'semester'                       => 'required|in:1st,2nd',
            'pct_core'                       => 'nullable|string|max:10',
            'pct_support'                    => 'nullable|string|max:10',
            'avg_core'                       => 'nullable|string|max:20',
            'avg_support'                    => 'nullable|string|max:20',
            'final_avg'                      => 'nullable|string|max:20',
            'adjectival_rating'              => 'nullable|string|max:50',
            'items'                          => 'required|array|min:1',
            'items.*.function_type'          => 'required|in:Core,Support',
            'items.*.strategic_goal'         => 'required|string',
            'items.*.performance_indicator'  => 'required|string',
            'items.*.actual_accomplishment'  => 'nullable|string',
            'items.*.accomplishment_rate'    => 'nullable|string|max:50',
            'items.*.rating_q'               => 'nullable|numeric|min:1|max:5',
            'items.*.rating_e'               => 'nullable|numeric|min:1|max:5',
            'items.*.rating_t'               => 'nullable|numeric|min:1|max:5',
            'items.*.rating_a'               => 'nullable|numeric|min:1|max:5',
            'items.*.remarks'                => 'nullable|string',
        ]);

        $form = IPCRForm::create([
            'employee_name'     => $validated['employee_name'],
            'employee_position' => $validated['employee_position']  ?? null,
            'employee_unit'     => $validated['employee_unit']      ?? null,
            'period'            => $validated['period']             ?? null,
            'supervisor'        => $validated['supervisor']         ?? null,
            'approved_by'       => $validated['approved_by']        ?? null,
            'recommending'      => $validated['recommending']       ?? null,
            'year'              => $validated['year'],
            'semester'          => $validated['semester'],
            'pct_core'          => $validated['pct_core']           ?? '70%',
            'pct_support'       => $validated['pct_support']        ?? '30%',
            'avg_core'          => $validated['avg_core']           ?? null,
            'avg_support'       => $validated['avg_support']        ?? null,
            'final_avg'         => $validated['final_avg']          ?? null,
            'adjectival_rating' => $validated['adjectival_rating']  ?? null,
        ]);

        foreach ($validated['items'] as $idx => $itemData) {
            IPCRItem::create([
                'ipcr_form_id'          => $form->id,
                'sort_order'            => $idx,
                'function_type'         => $itemData['function_type'],
                'strategic_goal'        => $itemData['strategic_goal'],
                'performance_indicator' => $itemData['performance_indicator'],
                'actual_accomplishment' => $itemData['actual_accomplishment'] ?? null,
                'accomplishment_rate'   => $itemData['accomplishment_rate']   ?? null,
                'rating_q'              => $itemData['rating_q']              ?? null,
                'rating_e'              => $itemData['rating_e']              ?? null,
                'rating_t'              => $itemData['rating_t']              ?? null,
                'rating_a'              => $itemData['rating_a']              ?? null,
                'remarks'               => $itemData['remarks']               ?? null,
            ]);
        }

        $form->load('items');

        return response()->json([
            'success' => true,
            'message' => 'IPCR saved successfully.',
            'form'    => $form,
        ], 201);
    }

    /**
     * Delete an IPCR form and its items.
     * DELETE /api/ipcr/{form}
     */
    public function destroy(IPCRForm $form): JsonResponse
    {
        $form->items()->delete();
        $form->delete();

        return response()->json(['success' => true, 'message' => 'IPCR deleted.']);
    }
}
