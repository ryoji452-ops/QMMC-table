<?php

// app/Http/Controllers/SPCRFormController.php
// Handles /api/spcr — Section Performance Commitment and Review

namespace App\Http\Controllers;

use App\Models\SPCRForm;
use App\Models\SPCRItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SPCRFormController extends Controller
{
    /** Return all SPCR forms (form_type = 'spcr') for current employee. */
    public function index(): JsonResponse
    {
        $forms = SPCRForm::spcr()->forCurrentUser()->with('items')->latest()->get();
        return response()->json($forms);
    }

    /** Save a new SPCR form. POST /api/spcr */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePayload($request);
        $empid     = $this->currentEmpid();

        $form = SPCRForm::create([
            'form_type'      => 'spcr',
            'user_id'        => $empid,
            'employee_name'  => $validated['employee_name'],
            'employee_title' => $validated['employee_position'] ?? null,
            'division'       => $validated['employee_unit']     ?? '—',
            'area'           => $validated['period']            ?? '—',
            'year'           => $validated['year'],
            'semester'       => $validated['semester'],
            'approved_by'    => $validated['approved_by']       ?? null,
        ]);

        foreach ($validated['items'] as $itemData) {
            if (!empty($itemData['is_section'])) continue;
            // Stamp user_id on every item row so items can be queried
            // directly by owner without joining sprc_forms.
            SPCRItem::create($this->buildItemRow($form->id, $itemData, $empid));
        }

        $form->load('items');

        return response()->json([
            'success' => true,
            'message' => 'SPCR form saved successfully.',
            'form'    => $form,
        ], 201);
    }

    /** Return a single SPCR form. GET /api/spcr/{form} */
    public function show(SPCRForm $form): JsonResponse
    {
        abort_if($form->form_type !== 'spcr', 404);
        abort_if($form->user_id !== $this->currentEmpid(), 403);
        $form->load('items');
        return response()->json($form);
    }

    /** Update an existing SPCR form. PUT /api/spcr/{form} */
    public function update(Request $request, SPCRForm $form): JsonResponse
    {
        abort_if($form->form_type !== 'spcr', 404);
        abort_if($form->user_id !== $this->currentEmpid(), 403);

        $validated = $this->validatePayload($request);
        $empid     = $this->currentEmpid();

        $form->update([
            'employee_name'  => $validated['employee_name'],
            'employee_title' => $validated['employee_position'] ?? null,
            'division'       => $validated['employee_unit']     ?? '—',
            'area'           => $validated['period']            ?? '—',
            'year'           => $validated['year'],
            'semester'       => $validated['semester'],
            'approved_by'    => $validated['approved_by']       ?? null,
        ]);

        // Replace all items, stamping the current user on every new row.
        $form->items()->delete();
        foreach ($validated['items'] as $itemData) {
            if (!empty($itemData['is_section'])) continue;
            SPCRItem::create($this->buildItemRow($form->id, $itemData, $empid));
        }

        $form->load('items');
        return response()->json([
            'success' => true,
            'message' => 'SPCR form updated successfully.',
            'form'    => $form,
        ]);
    }

    /** Delete an SPCR form. DELETE /api/spcr/{form} */
    public function destroy(SPCRForm $form): JsonResponse
    {
        abort_if($form->form_type !== 'spcr', 404);
        abort_if($form->user_id !== $this->currentEmpid(), 403);
        $form->items()->delete();
        $form->delete();
        return response()->json(['success' => true, 'message' => 'SPCR form deleted.']);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
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

            'items.*.allotted_budget'        => 'sometimes|nullable|string|max:255',
            'items.*.person_accountable'     => 'sometimes|nullable|string|max:255',
            'items.*.actual_accomplishment'  => 'sometimes|nullable|string',
            'items.*.accomplishment_rate'    => 'sometimes|nullable|string|max:50',
            'items.*.check_q'               => 'sometimes|nullable|boolean',
            'items.*.check_e'               => 'sometimes|nullable|boolean',
            'items.*.check_t'               => 'sometimes|nullable|boolean',
            'items.*.rating_q'              => 'sometimes|nullable|numeric|min:1|max:5',
            'items.*.rating_e'              => 'sometimes|nullable|numeric|min:1|max:5',
            'items.*.rating_t'              => 'sometimes|nullable|numeric|min:1|max:5',
            'items.*.rating_a'              => 'sometimes|nullable|numeric|min:1|max:5',
            'items.*.remarks'                => 'sometimes|nullable|string',
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
            'section_accountable'   => $itemData['person_accountable']    ?? 'ALL SECTIONS',
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