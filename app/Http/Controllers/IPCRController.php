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
     * Return the current employee's IPCR forms as JSON.
     * GET /api/ipcr
     *
     * forCurrentUser() resolves empid from the X-Employee-Id header first
     * (authoritative, set by JS on every apiFetch from window.EMPID) then
     * falls back to the session.  A stale session value can never cause
     * another employee's records to be returned.
     */
    public function index(): JsonResponse
    {
        $forms = IPCRForm::forCurrentUser()->with('items')->latest()->get();
        return response()->json($forms);
    }

    /**
     * Return a single IPCR form with its items.
     * GET /api/ipcr/{form}
     */
    public function show(IPCRForm $form): JsonResponse
    {
        abort_if($form->user_id !== $this->currentEmpid(), 403);
        $form->load('items');
        return response()->json($form);
    }

    /**
     * Save a new IPCR form + its items.
     * POST /api/ipcr
     *
     * Both the parent form row and every child item row are stamped with
     * the same user_id so that ownership can be verified at both levels.
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
            'items.*.function_type'          => 'required|in:Core,Support,Strategic',
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

        // currentEmpid() prefers the X-Employee-Id header (sent by every JS
        // apiFetch call from window.EMPID) over the session value.
        $empid = $this->currentEmpid();

        $form = IPCRForm::create([
            'user_id'           => $empid,   // ← stamps the submitting user on the form
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
            // Stamp user_id on every item row so items can be queried
            // directly by owner without joining ipcr_forms.
            IPCRItem::create([
                'ipcr_form_id'          => $form->id,
                'user_id'               => $empid,   // ← stamps owner on every item
                'sort_order'            => $idx,
                'function_type'         => $itemData['function_type'],
                'strategic_goal'        => $itemData['strategic_goal'],
                'performance_indicator' => $itemData['performance_indicator'],
                'actual_accomplishment' => $itemData['actual_accomplishment'] ?? null,
                'accomplishment_rate'   => $itemData['accomplishment_rate']   ?? null,
                'rating_q'              => (float)($itemData['rating_q'] ?? 0),
                'rating_e'              => (float)($itemData['rating_e'] ?? 0),
                'rating_t'              => (float)($itemData['rating_t'] ?? 0),
                'rating_a'              => (float)($itemData['rating_a'] ?? 0),
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
        abort_if($form->user_id !== $this->currentEmpid(), 403);
        $form->items()->delete();
        $form->delete();

        return response()->json(['success' => true, 'message' => 'IPCR deleted.']);
    }

    /**
     * Update an existing IPCR form + replace its items.
     * PUT /api/ipcr/{form}
     */
    public function update(Request $request, IPCRForm $form): JsonResponse
    {
        abort_if($form->user_id !== $this->currentEmpid(), 403);

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
            'items.*.function_type'          => 'required|in:Core,Support,Strategic',
            'items.*.strategic_goal'         => 'required|string',
            'items.*.performance_indicator'  => 'required|string',
            'items.*.actual_accomplishment'  => 'nullable|string',
            'items.*.accomplishment_rate'    => 'nullable|string|max:50',
            'items.*.check_q'               => 'nullable|boolean',
            'items.*.check_e'               => 'nullable|boolean',
            'items.*.check_t'               => 'nullable|boolean',
            'items.*.rating_q'              => 'nullable|numeric|min:1|max:5',
            'items.*.rating_e'              => 'nullable|numeric|min:1|max:5',
            'items.*.rating_t'              => 'nullable|numeric|min:1|max:5',
            'items.*.rating_a'              => 'nullable|numeric|min:1|max:5',
            'items.*.remarks'               => 'nullable|string',
        ]);

        $empid = $this->currentEmpid();

        $form->update([
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

        // Replace all items, stamping the current user on every new row.
        $form->items()->delete();
        foreach ($validated['items'] as $idx => $itemData) {
            IPCRItem::create([
                'ipcr_form_id'          => $form->id,
                'user_id'               => $empid,   // ← stamps owner on every item
                'sort_order'            => $idx,
                'function_type'         => $itemData['function_type'],
                'strategic_goal'        => $itemData['strategic_goal'],
                'performance_indicator' => $itemData['performance_indicator'],
                'actual_accomplishment' => $itemData['actual_accomplishment'] ?? null,
                'accomplishment_rate'   => $itemData['accomplishment_rate']   ?? null,
                'rating_q'              => (float)($itemData['rating_q'] ?? 0),
                'rating_e'              => (float)($itemData['rating_e'] ?? 0),
                'rating_t'              => (float)($itemData['rating_t'] ?? 0),
                'rating_a'              => (float)($itemData['rating_a'] ?? 0),
                'remarks'               => $itemData['remarks']               ?? null,
            ]);
        }

        $form->load('items');
        return response()->json([
            'success' => true,
            'message' => 'IPCR updated successfully.',
            'form'    => $form,
        ]);
    }
}