<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add user_id to sprc_items and ipcr_items.
     *
     * Why add user_id directly to items (instead of only on the parent form)?
     * ─────────────────────────────────────────────────────────────────────────
     * The parent forms (sprc_forms, ipcr_forms) already carry user_id, so items
     * are indirectly owned via the foreign key to their parent form.
     *
     * Adding user_id directly to the items tables gives us:
     *   1. Fast user-scoped item queries without a JOIN.
     *   2. A clear audit trail — every item row knows its owner.
     *   3. Consistency: same pattern already used on the form tables.
     *
     * Back-fill strategy
     * ──────────────────
     * After adding the column we back-fill it from the parent form's user_id
     * so existing data is never orphaned.
     *
     * No foreign-key constraint is added (matches the parent form convention)
     * to avoid INT vs BIGINT mismatches with the legacy bvflh_users table.
     */
    public function up(): void
    {
        // ── sprc_items ────────────────────────────────────────────────────
        if (! Schema::hasColumn('sprc_items', 'user_id')) {
            Schema::table('sprc_items', function (Blueprint $table) {
                $table->integer('user_id')
                      ->nullable()
                      ->after('id')
                      ->index();
            });

            // Back-fill from parent sprc_forms.user_id
            DB::statement('
                UPDATE sprc_items si
                INNER JOIN sprc_forms sf ON sf.id = si.sprc_form_id
                SET si.user_id = sf.user_id
                WHERE si.user_id IS NULL
            ');
        }

        // ── ipcr_items ────────────────────────────────────────────────────
        if (! Schema::hasColumn('ipcr_items', 'user_id')) {
            Schema::table('ipcr_items', function (Blueprint $table) {
                $table->integer('user_id')
                      ->nullable()
                      ->after('id')
                      ->index();
            });

            // Back-fill from parent ipcr_forms.user_id
            DB::statement('
                UPDATE ipcr_items ii
                INNER JOIN ipcr_forms i_f ON i_f.id = ii.ipcr_form_id
                SET ii.user_id = i_f.user_id
                WHERE ii.user_id IS NULL
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('sprc_items', 'user_id')) {
            Schema::table('sprc_items', function (Blueprint $table) {
                $table->dropColumn('user_id');
            });
        }

        if (Schema::hasColumn('ipcr_items', 'user_id')) {
            Schema::table('ipcr_items', function (Blueprint $table) {
                $table->dropColumn('user_id');
            });
        }
    }
};
