<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * プロジェクトテーブルを作成する
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['active', 'completed', 'on_hold', 'cancelled'])
                  ->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * プロジェクトテーブルを削除する
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
