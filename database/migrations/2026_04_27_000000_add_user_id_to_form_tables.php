<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds user_id to sprc_forms and ipcr_forms.
     * No foreign key constraint — avoids INT vs BIGINT mismatch issues.
     */
    public function up(): void
    {
        // ── sprc_forms (DPCR + SPCR) ─────────────────────────────────
        if (!Schema::hasColumn('sprc_forms', 'user_id')) {
            Schema::table('sprc_forms', function (Blueprint $table) {
                $table->integer('user_id')
                      ->nullable()
                      ->after('id')
                      ->index();
            });
        }

        // ── ipcr_forms ────────────────────────────────────────────────
        if (!Schema::hasColumn('ipcr_forms', 'user_id')) {
            Schema::table('ipcr_forms', function (Blueprint $table) {
                $table->integer('user_id')
                      ->nullable()
                      ->after('id')
                      ->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('sprc_forms', 'user_id')) {
            Schema::table('sprc_forms', function (Blueprint $table) {
                $table->dropColumn('user_id');
            });
        }

        if (Schema::hasColumn('ipcr_forms', 'user_id')) {
            Schema::table('ipcr_forms', function (Blueprint $table) {
                $table->dropColumn('user_id');
            });
        }
    }
};