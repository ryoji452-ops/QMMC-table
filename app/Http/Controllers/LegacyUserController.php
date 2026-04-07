<?php

namespace App\Http\Controllers;

use App\Models\LegacyUser;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LegacyUserController extends Controller
{
    /**
     * Return paginated + searchable list of all legacy users as JSON.
     * GET /api/legacy-users
     */
    public function index(Request $request): JsonResponse
    {
        $query = LegacyUser::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('l_name',   'like', "%{$search}%")
                  ->orWhere('f_name',   'like', "%{$search}%")
                  ->orWhere('m_name',   'like', "%{$search}%")
                  ->orWhere('division', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhere('section',  'like', "%{$search}%")
                  ->orWhere('name',     'like', "%{$search}%");
            });
        }

        if ($division = $request->query('division')) {
            $query->where('division', $division);
        }

        $perPage = min((int) $request->query('per_page', 50), 200);

        $users = $query->orderBy('l_name')->orderBy('f_name')->paginate($perPage);

        // Map each user to include the computed full_name attribute
        $mapped = collect($users->items())->map(function ($u) {
            return [
                'id'             => $u->id,
                'full_name'      => $u->full_name,
                'l_name'         => $u->l_name,
                'f_name'         => $u->f_name,
                'm_name'         => $u->m_name,
                'division'       => $u->division,
                'position'       => $u->position,
                'section'        => $u->section,
                'name'           => $u->name,
                'division_label' => $u->division_label,
            ];
        });

        return response()->json([
            'data'         => $mapped,
            'total'        => $users->total(),
            'current_page' => $users->currentPage(),
            'last_page'    => $users->lastPage(),
            'per_page'     => $users->perPage(),
        ]);
    }

    /**
     * Return a single legacy user by ID.
     * GET /api/legacy-users/{id}
     */
    public function show(int $id): JsonResponse
    {
        $user = LegacyUser::findOrFail($id);

        return response()->json([
            'id'             => $user->id,
            'full_name'      => $user->full_name,
            'l_name'         => $user->l_name,
            'f_name'         => $user->f_name,
            'm_name'         => $user->m_name,
            'division'       => $user->division,
            'position'       => $user->position,
            'section'        => $user->section,
            'name'           => $user->name,
            'division_label' => $user->division_label,
        ]);
    }

    /**
     * Return distinct non-empty division values for the filter dropdown.
     * GET /api/legacy-users/divisions
     */
    public function divisions(): JsonResponse
    {
        $divisions = LegacyUser::select('division')
            ->whereNotNull('division')
            ->where('division', '!=', '')
            ->distinct()
            ->orderBy('division')
            ->pluck('division');

        return response()->json($divisions);
    }
}