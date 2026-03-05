<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spcr_rating_matrices', function (Blueprint $table) {
            $table->id();
            $table->string('prepared_by');
            $table->string('prepared_by_title')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->string('reviewed_by_title')->nullable();
            $table->string('approved_by')->nullable();
            $table->string('approved_by_title')->nullable();
            $table->date('prepared_date')->nullable();
            $table->date('reviewed_date')->nullable();
            $table->date('approved_date')->nullable();
            $table->timestamps();
        });

        Schema::create('spcr_rating_matrix_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matrix_id')
                  ->constrained('spcr_rating_matrices')
                  ->onDelete('cascade');
            $table->boolean('is_section')->default(false);
            $table->string('section_label')->nullable();
            $table->text('performance_measure')->nullable();
            $table->text('operational_definition')->nullable();
            $table->text('quality')->nullable();
            $table->text('efficiency')->nullable();
            $table->text('timeliness')->nullable();
            $table->text('source_monitoring')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spcr_rating_matrix_items');
        Schema::dropIfExists('spcr_rating_matrices');
    }
};