<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 作業ログテーブルを作成する
     */
    public function up(): void
    {
        Schema::create('work_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('worked_date');
            $table->decimal('hours', 5, 2);
            $table->string('description')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * 作業ログテーブルを削除する
     */
    public function down(): void
    {
        Schema::dropIfExists('work_logs');
    }
};
