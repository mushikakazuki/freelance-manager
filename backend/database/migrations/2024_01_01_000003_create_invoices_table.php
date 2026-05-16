<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 請求書テーブルを作成する
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])
                  ->default('draft');
            $table->decimal('amount', 12, 2);
            $table->decimal('tax_rate', 5, 2)->default(10.00);
            $table->date('issued_at')->nullable();
            $table->date('due_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * 請求書テーブルを削除する
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
