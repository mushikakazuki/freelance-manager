<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 契約テーブルを作成する
     */
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('monthly_rate', 12, 2)->nullable();
            $table->integer('payment_terms')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * 契約テーブルを削除する
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
