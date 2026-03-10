<?php

// database/migrations/xxxx_xx_xx_create_ipcr_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ipcr_forms', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');
            $table->string('employee_position')->nullable();
            $table->string('employee_unit')->nullable();
            $table->string('period')->nullable();
            $table->string('supervisor')->nullable();
            $table->string('approved_by')->nullable();
            $table->string('recommending')->nullable();
            $table->unsignedSmallInteger('year');
            $table->enum('semester', ['1st', '2nd']);
            $table->string('pct_core',   10)->default('70%');
            $table->string('pct_support', 10)->default('30%');
            $table->string('avg_core',    20)->nullable();
            $table->string('avg_support', 20)->nullable();
            $table->string('final_avg',   20)->nullable();
            $table->string('adjectival_rating', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('ipcr_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ipcr_form_id')->constrained('ipcr_forms')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->enum('function_type', ['Core', 'Support']);
            $table->text('strategic_goal');
            $table->text('performance_indicator');
            $table->text('actual_accomplishment')->nullable();
            $table->string('accomplishment_rate', 50)->nullable();
            $table->decimal('rating_q', 4, 2)->nullable();
            $table->decimal('rating_e', 4, 2)->nullable();
            $table->decimal('rating_t', 4, 2)->nullable();
            $table->decimal('rating_a', 4, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ipcr_items');
        Schema::dropIfExists('ipcr_forms');
    }
};
