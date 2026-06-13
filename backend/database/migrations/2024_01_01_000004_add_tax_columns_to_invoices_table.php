<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * invoicesテーブルに税額・税込合計カラムを追加する
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('tax_amount', 12, 2)->after('tax_rate');
            $table->decimal('total_amount', 12, 2)->after('tax_amount');
        });
    }

    /**
     * invoicesテーブルから税額・税込合計カラムを削除する
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['tax_amount', 'total_amount']);
        });
    }
};
