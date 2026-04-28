<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Return the current employee ID.
     *
     * Resolution order:
     *   1. X-Employee-Id request header — sent by every apiFetch() call in JS.
     *      This is the authoritative source because window.EMPID is injected
     *      directly from the URL /{empid} by QmmcController and is always correct.
     *   2. session('current_empid')  — fallback when no header is present
     *      (e.g. server-side page-load queries in QmmcController itself).
     *
     * When the header and session disagree the header wins and the session is
     * corrected so subsequent requests in the same lifecycle stay consistent.
     * This prevents the root-URL (/) "first-user" session pollution from
     * causing the wrong employee's records to be returned on API calls.
     */
    protected function currentEmpid(): ?int
    {
        $fromHeader  = request()->header('X-Employee-Id');
        $fromSession = session('current_empid');

        // Header is the authoritative source — always prefer it.
        if ($fromHeader && is_numeric($fromHeader)) {
            $empid = (int) $fromHeader;

            // Re-sync session if it was stale / missing.
            if ((int) $fromSession !== $empid) {
                session(['current_empid' => $empid]);
            }

            return $empid;
        }

        // No header present (server-side calls, e.g. QmmcController page load).
        if ($fromSession && is_numeric($fromSession)) {
            return (int) $fromSession;
        }

        return null;
    }
}