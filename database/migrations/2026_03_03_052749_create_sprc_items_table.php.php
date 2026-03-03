<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sprc_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sprc_form_id')->constrained()->onDelete('cascade');
            $table->enum('function_type', ['Strategic', 'Core', 'Support']);
            $table->text('strategic_goal');                        // new: goal description
            $table->text('performance_indicator');                 // was 'target'
            $table->string('allotted_budget')->nullable();
            $table->string('section_accountable');
            $table->text('actual_accomplishment')->nullable();
            $table->string('accomplishment_rate')->nullable();     // new: e.g. "85%"
            $table->boolean('rating_q')->default(false);
            $table->boolean('rating_e')->default(false);
            $table->boolean('rating_t')->default(false);
            $table->boolean('rating_a')->default(false);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sprc_items');
    }
};