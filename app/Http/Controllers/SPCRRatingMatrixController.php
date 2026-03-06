<?php

// app/Http/Controllers/SPCRRatingMatrixController.php

namespace App\Http\Controllers;

use App\Models\SPCRRatingMatrix;
use App\Models\SPCRRatingMatrixItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SPCRRatingMatrixController extends Controller
{
    /**
     * Return all matrices as JSON (used by JS to populate the saved list).
     */
    public function index(): JsonResponse
    {
        $matrices = SPCRRatingMatrix::latest()->get();
        return response()->json($matrices);
    }

    /**
     * Save a new SPCR Rating Matrix + its items.
     * Called via JS fetch POST /api/spcr-matrix
     */
    public function store(Request $request): JsonResponse
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
            'items.*.is_section'             => 'sometimes|nullable|boolean',
            'items.*.section_label'          => 'sometimes|nullable|string|max:255',
            'items.*.performance_measure'    => 'sometimes|nullable|string',
            'items.*.operational_definition' => 'sometimes|nullable|string',
            'items.*.quality'                => 'sometimes|nullable|string',
            'items.*.efficiency'             => 'sometimes|nullable|string',
            'items.*.timeliness'             => 'sometimes|nullable|string',
            'items.*.source_monitoring'      => 'sometimes|nullable|string',
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

        $matrix->load('items');

        return response()->json([
            'success' => true,
            'message' => 'SPCR Rating Matrix saved successfully.',
            'matrix'  => $matrix,
        ], 201);
    }

    /**
     * Return a single matrix with its items as JSON.
     * Called by JS when user clicks "View".
     */
    public function show(SPCRRatingMatrix $matrix): JsonResponse
    {
        $matrix->load('items');
        return response()->json($matrix);
    }

    /**
     * Delete a matrix (cascade deletes items via DB constraint).
     */
    public function destroy(SPCRRatingMatrix $matrix): JsonResponse
    {
        $matrix->delete();
        return response()->json([
            'success' => true,
            'message' => 'Rating matrix deleted.',
        ]);
    }
}