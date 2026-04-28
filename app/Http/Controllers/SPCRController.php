<?php

// app/Http/Controllers/SPCRController.php
// Handles /api/dpcr — Division Performance Commitment and Review

namespace App\Http\Controllers;

use App\Models\SPCRForm;
use App\Models\SPCRItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SPCRController extends Controller
{
    /** Return all DPCR forms (form_type = 'dpcr') for current employee. */
    public function index(): JsonResponse
    {
        $forms = SPCRForm::dpcr()->forCurrentUser()->with('items')->latest()->get();
        return response()->json($forms);
    }

    /** Save a new DPCR form. POST /api/dpcr */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);

        $empid = $this->currentEmpid();

        $form = SPCRForm::create([
            'form_type'         => 'dpcr',
            'user_id'           => $empid,
            'employee_name'     => $validated['employee_name'],
            'employee_title'    => $validated['employee_title']    ?? null,
            'division'          => $validated['division']          ?? 'Admin',
            'area'              => $validated['area']              ?? 'HOPSS',
            'year'              => $validated['year'],
            'semester'          => $validated['semester'],
            'approved_by'       => $validated['approved_by']       ?? null,
            'approved_by_title' => $validated['approved_by_title'] ?? null,
            'signed_date'       => $validated['signed_date']       ?? null,
        ]);

        foreach ($validated['items'] as $itemData) {
            // Stamp user_id on every item row so items can be queried
            // directly by owner without joining sprc_forms.
            SPCRItem::create($this->buildItemRow($form->id, $itemData, $empid));
        }

        $form->load('items');

        return response()->json([
            'success' => true,
            'message' => 'DPCR saved successfully.',
            'form'    => $form,
        ], 201);
    }

    /** Return a single DPCR form. GET /api/dpcr/{id} */
    public function show(SPCRForm $form): JsonResponse
    {
        abort_if($form->form_type !== 'dpcr', 404);
        abort_if($form->user_id !== $this->currentEmpid(), 403);
        $form->load('items');
        return response()->json($form);
    }

    /** Update an existing DPCR form. PUT /api/dpcr/{id} */
    public function update(Request $request, SPCRForm $form): JsonResponse
    {
        abort_if($form->form_type !== 'dpcr', 404);
        abort_if($form->user_id !== $this->currentEmpid(), 403);

        $validated = $this->validatePayload($request);
        $empid     = $this->currentEmpid();

        $form->update([
            'employee_name'  => $validated['employee_name'],
            'employee_title' => $validated['employee_title'] ?? null,
            'division'       => $validated['division']       ?? 'Admin',
            'area'           => $validated['area']           ?? 'HOPSS',
            'year'           => $validated['year'],
            'semester'       => $validated['semester'],
            'approved_by'    => $validated['approved_by']    ?? null,
        ]);

        // Replace all items, stamping the current user on every new row.
        $form->items()->delete();
        foreach ($validated['items'] as $itemData) {
            SPCRItem::create($this->buildItemRow($form->id, $itemData, $empid));
        }

        $form->load('items');
        return response()->json([
            'success' => true,
            'message' => 'DPCR updated successfully.',
            'form'    => $form,
        ]);
    }

    /** Delete a DPCR form. DELETE /api/dpcr/{id} */
    public function destroy(SPCRForm $form): JsonResponse
    {
        abort_if($form->form_type !== 'dpcr', 404);
        abort_if($form->user_id !== $this->currentEmpid(), 403);
        $form->items()->delete();
        $form->delete();
        return response()->json(['success' => true, 'message' => 'DPCR deleted.']);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'employee_name'                  => 'required|string|max:255',
            'employee_title'                 => 'nullable|string|max:255',
            'division'                       => 'nullable|string|max:255',
            'area'                           => 'nullable|string|max:255',
            'year'                           => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'semester'                       => 'required|in:1st,2nd',
            'approved_by'                    => 'nullable|string|max:255',
            'approved_by_title'              => 'nullable|string|max:255',
            'signed_date'                    => 'nullable|date',
            'items'                          => 'required|array|min:1',
            'items.*.function_type'          => 'nullable|string|in:Strategic,Core,Support',
            'items.*.strategic_goal'         => 'nullable|string',
            'items.*.performance_indicator'  => 'nullable|string',
            'items.*.allotted_budget'        => 'nullable|string|max:255',
            'items.*.section_accountable'    => 'nullable|string|max:255',
            'items.*.actual_accomplishment'  => 'nullable|string',
            'items.*.accomplishment_rate'    => 'nullable|string|max:50',
            'items.*.check_q'               => 'nullable|boolean',
            'items.*.check_e'               => 'nullable|boolean',
            'items.*.check_t'               => 'nullable|boolean',
            'items.*.rating_q'              => 'nullable|numeric|min:1|max:5',
            'items.*.rating_e'              => 'nullable|numeric|min:1|max:5',
            'items.*.rating_t'              => 'nullable|numeric|min:1|max:5',
            'items.*.rating_a'              => 'nullable|numeric|min:1|max:5',
            'items.*.remarks'                => 'nullable|string',
        ]);
    }

    /**
     * Build the data array for a single SPCRItem row.
     *
     * @param  int        $formId   The parent sprc_forms.id
     * @param  array      $itemData Validated item payload
     * @param  int|null   $empid   The bvflh_users.id of the submitting user
     */
    private function buildItemRow(int $formId, array $itemData, ?int $empid = null): array
    {
        return [
            'sprc_form_id'          => $formId,
            'user_id'               => $empid,            // ← stamps owner on every item
            'function_type'         => $itemData['function_type']         ?? 'Strategic',
            'strategic_goal'        => $itemData['strategic_goal']        ?? '',
            'performance_indicator' => $itemData['performance_indicator'] ?? '',
            'allotted_budget'       => $itemData['allotted_budget']       ?? null,
            'section_accountable'   => $itemData['section_accountable']   ?? 'ALL SECTIONS',
            'actual_accomplishment' => $itemData['actual_accomplishment'] ?? null,
            'accomplishment_rate'   => $itemData['accomplishment_rate']   ?? null,
            'rating_q'              => (float)($itemData['rating_q'] ?? 0),
            'rating_e'              => (float)($itemData['rating_e'] ?? 0),
            'rating_t'              => (float)($itemData['rating_t'] ?? 0),
            'rating_a'              => (float)($itemData['rating_a'] ?? 0),
            'remarks'               => $itemData['remarks']               ?? null,
        ];
    }
}