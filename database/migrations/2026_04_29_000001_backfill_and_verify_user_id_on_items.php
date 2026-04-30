<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Backfill & verify user_id on sprc_items and ipcr_items.
 *
 * Why this migration exists
 * ──────────────────────────
 * The previous migration (2026_04_28_000001) added the user_id column
 * and ran a back-fill, but only for rows where user_id IS NULL *at that
 * exact moment*.  Any records saved AFTER the column was added but where
 * the controller failed to stamp user_id (e.g. a deploy race-condition,
 * or the JS not yet sending X-Employee-Id) would have been left with NULL.
 *
 * This migration:
 *   1. Ensures the user_id column exists on both tables (idempotent).
 *   2. Runs a comprehensive back-fill JOIN so every item row that has a
 *      parent form with a known user_id gets that value propagated.
 *   3. Adds a composite index (user_id, sprc_form_id) / (user_id, ipcr_form_id)
 *      to speed up the per-user filtered queries used by the controllers.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Ensure columns exist (defensive — migration may run on a
        //       fresh DB that skipped the previous migration somehow) ──────
        if (! Schema::hasColumn('sprc_items', 'user_id')) {
            Schema::table('sprc_items', function (Blueprint $table) {
                $table->integer('user_id')->nullable()->after('id')->index();
            });
        }

        if (! Schema::hasColumn('ipcr_items', 'user_id')) {
            Schema::table('ipcr_items', function (Blueprint $table) {
                $table->integer('user_id')->nullable()->after('id')->index();
            });
        }

        // ── 2. Back-fill sprc_items from parent sprc_forms.user_id ────────
        //       Covers ALL rows where user_id is still NULL, regardless of
        //       when the record was created.
        DB::statement('
            UPDATE sprc_items si
            INNER JOIN sprc_forms sf ON sf.id = si.sprc_form_id
            SET si.user_id = sf.user_id
            WHERE si.user_id IS NULL
              AND sf.user_id IS NOT NULL
        ');

        // ── 3. Back-fill ipcr_items from parent ipcr_forms.user_id ───────
        DB::statement('
            UPDATE ipcr_items ii
            INNER JOIN ipcr_forms i_f ON i_f.id = ii.ipcr_form_id
            SET ii.user_id = i_f.user_id
            WHERE ii.user_id IS NULL
              AND i_f.user_id IS NOT NULL
        ');

        // ── 4. Add composite indexes for fast per-user queries ─────────────
        //       Only add if they do not already exist (MySQL-safe check).
        $sprcIndexes  = collect(DB::select('SHOW INDEX FROM sprc_items'))
                            ->pluck('Key_name')->unique()->values()->toArray();
        $ipcrIndexes  = collect(DB::select('SHOW INDEX FROM ipcr_items'))
                            ->pluck('Key_name')->unique()->values()->toArray();

        if (! in_array('sprc_items_user_form_idx', $sprcIndexes)) {
            Schema::table('sprc_items', function (Blueprint $table) {
                $table->index(['user_id', 'sprc_form_id'], 'sprc_items_user_form_idx');
            });
        }

        if (! in_array('ipcr_items_user_form_idx', $ipcrIndexes)) {
            Schema::table('ipcr_items', function (Blueprint $table) {
                $table->index(['user_id', 'ipcr_form_id'], 'ipcr_items_user_form_idx');
            });
        }
    }

    public function down(): void
    {
        // Remove the composite indexes added by this migration.
        // Leave the user_id columns in place — those are managed by the
        // previous migration (2026_04_28_000001).
        $sprcIndexes = collect(DB::select('SHOW INDEX FROM sprc_items'))
                           ->pluck('Key_name')->unique()->values()->toArray();
        $ipcrIndexes = collect(DB::select('SHOW INDEX FROM ipcr_items'))
                           ->pluck('Key_name')->unique()->values()->toArray();

        if (in_array('sprc_items_user_form_idx', $sprcIndexes)) {
            Schema::table('sprc_items', function (Blueprint $table) {
                $table->dropIndex('sprc_items_user_form_idx');
            });
        }

        if (in_array('ipcr_items_user_form_idx', $ipcrIndexes)) {
            Schema::table('ipcr_items', function (Blueprint $table) {
                $table->dropIndex('ipcr_items_user_form_idx');
            });
        }
    }
};