<?php

namespace App\Http\Controllers;

use App\Models\SPCRRatingMatrix;
use App\Models\SPCRRatingMatrixItem;
use Illuminate\Http\Request;

class SPCRRatingMatrixController extends Controller
{
    public function index()
    {
        $matrices = SPCRRatingMatrix::latest()->get();
        return view('spcr.rating_matrix', compact('matrices'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prepared_by'                    => 'required|string|max:255',
            'prepared_by_title'              => 'nullable|string|max:255',
            'reviewed_by'                    => 'nullable|string|max:255',
            'reviewed_by_title'              => 'nullable|string|max:255',
            'approved_by'                    => 'nullable|string|max:255',
            'approved_by_title'              => 'nullable|string|max:255',
            'prepared_date'                  => 'nullable|date',
            'reviewed_date'                  => 'nullable|date',
            'approved_date'                  => 'nullable|date',
            'items'                          => 'required|array|min:1',
            'items.*.is_section'             => 'nullable|boolean',
            'items.*.section_label'          => 'nullable|string|max:255',
            'items.*.performance_measure'    => 'nullable|string',
            'items.*.operational_definition' => 'nullable|string',
            'items.*.quality'                => 'nullable|string',
            'items.*.efficiency'             => 'nullable|string',
            'items.*.timeliness'             => 'nullable|string',
            'items.*.source_monitoring'      => 'nullable|string',
        ]);

        $matrix = SPCRRatingMatrix::create([
            'prepared_by'       => $validated['prepared_by'],
            'prepared_by_title' => $validated['prepared_by_title'] ?? null,
            'reviewed_by'       => $validated['reviewed_by'] ?? null,
            'reviewed_by_title' => $validated['reviewed_by_title'] ?? null,
            'approved_by'       => $validated['approved_by'] ?? null,
            'approved_by_title' => $validated['approved_by_title'] ?? null,
            'prepared_date'     => $validated['prepared_date'] ?? null,
            'reviewed_date'     => $validated['reviewed_date'] ?? null,
            'approved_date'     => $validated['approved_date'] ?? null,
        ]);

        foreach ($validated['items'] as $order => $itemData) {
            SPCRRatingMatrixItem::create([
                'matrix_id'              => $matrix->id,
                'is_section'             => !empty($itemData['is_section']),
                'section_label'          => $itemData['section_label'] ?? null,
                'performance_measure'    => $itemData['performance_measure'] ?? null,
                'operational_definition' => $itemData['operational_definition'] ?? null,
                'quality'                => $itemData['quality'] ?? null,
                'efficiency'             => $itemData['efficiency'] ?? null,
                'timeliness'             => $itemData['timeliness'] ?? null,
                'source_monitoring'      => $itemData['source_monitoring'] ?? null,
                'sort_order'             => $order,
            ]);
        }

        return redirect()->route('spcr.matrix.index')
                         ->with('success', 'SPCR Rating Matrix saved successfully.');
    }

    public function show(SPCRRatingMatrix $matrix)
    {
        $matrix->load('items');
        return view('spcr.rating_matrix_show', compact('matrix'));
    }

    public function destroy(SPCRRatingMatrix $matrix)
    {
        $matrix->delete();
        return redirect()->route('spcr.matrix.index')
                         ->with('success', 'Rating matrix deleted.');
    }
}