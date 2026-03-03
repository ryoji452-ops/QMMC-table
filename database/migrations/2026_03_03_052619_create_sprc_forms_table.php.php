<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sprc_forms', function (Blueprint $table) {
            $table->id();
            $table->string('employee_name');
            $table->string('employee_title')->nullable();          // e.g. "Chief of Hospital Operations..."
            $table->string('division');                             // Admin, Nursing, etc.
            $table->string('area');                                 // e.g. "HOPSS"
            $table->year('year');
            $table->enum('semester', ['1st', '2nd']);
            $table->string('approved_by')->nullable();             // name of approver
            $table->string('approved_by_title')->nullable();       // title of approver
            $table->date('signed_date')->nullable();               // date of signing
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sprc_forms');
    }
};