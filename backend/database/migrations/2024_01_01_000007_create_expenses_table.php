<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 経費テーブルを作成する
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->enum('category', ['transportation', 'supplies', 'outsourcing', 'other']);
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->date('incurred_at');
            $table->string('receipt_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * 経費テーブルを削除する
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
