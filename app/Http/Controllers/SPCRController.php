<?php

namespace App\Http\Controllers;

use App\Models\SPCRForm;
use App\Models\SPCRItem;
use Illuminate\Http\Request;

class SPCRController extends Controller
{
    public function index()
    {
        $forms = SPCRForm::with('items')->latest()->get();
        $divisions = ['Admin', 'Nursing', 'Finance', 'Allied', 'Medical'];
        $sections = ['ICMS Staff', 'Head', 'Nursing', 'Finance', 'Allied', 'Medical', 'EFMS', 'PMG', 'PROCUREMENT', 'IMISS'];
        $functionTypes = ['Strategic', 'Core', 'Support'];
        $semesters = [
            '1st' => '1st (January - June)',
            '2nd' => '2nd (July - December)'
        ];

        return view('sprc.index', compact('forms', 'divisions', 'sections', 'functionTypes', 'semesters'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_name'      => 'required|string|max:255',
            'employee_title'     => 'nullable|string|max:255',
            'division'           => 'required|in:Admin,Nursing,Finance,Allied,Medical',
            'area'               => 'required|string|max:255',
            'year'               => 'required|integer|min:2000|max:' . (date('Y')+1),
            'semester'           => 'required|in:1st,2nd',
            'approved_by'        => 'nullable|string|max:255',
            'approved_by_title'  => 'nullable|string|max:255',
            'signed_date'        => 'nullable|date',
            'items'              => 'required|array|min:1',
            'items.*.function_type'          => 'required|in:Strategic,Core,Support',
            'items.*.strategic_goal'         => 'required|string',
            'items.*.performance_indicator'  => 'required|string',
            'items.*.allotted_budget'        => 'nullable|string|max:255',
            'items.*.section_accountable'    => 'required|string|max:255',
            'items.*.actual_accomplishment'  => 'nullable|string',
            'items.*.accomplishment_rate'    => 'nullable|string|max:50',
            'items.*.remarks'                 => 'nullable|string',
        ]);

        // Create main form
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

        // Create each item
        foreach ($validated['items'] as $itemData) {
            $item = new SPCRItem();
            $item->sprc_form_id = $form->id;
            $item->function_type = $itemData['function_type'];
            $item->strategic_goal = $itemData['strategic_goal'];
            $item->performance_indicator = $itemData['performance_indicator'];
            $item->allotted_budget = $itemData['allotted_budget'] ?? null;
            $item->section_accountable = $itemData['section_accountable'];
            $item->actual_accomplishment = $itemData['actual_accomplishment'] ?? null;
            $item->accomplishment_rate = $itemData['accomplishment_rate'] ?? null;
            $item->remarks = $itemData['remarks'] ?? null;

            $item->rating_q = isset($itemData['rating_q']) ? true : false;
            $item->rating_e = isset($itemData['rating_e']) ? true : false;
            $item->rating_t = isset($itemData['rating_t']) ? true : false;
            $item->rating_a = isset($itemData['rating_a']) ? true : false;

            $item->save();
        }

        return redirect()->route('sprc.index')->with('success', 'DPCR saved successfully.');
    }
}