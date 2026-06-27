<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    public function definition(): array
    {
        $quantity  = fake()->randomFloat(2, 1, 10);
        $unitPrice = fake()->randomFloat(2, 1000, 50000);

        return [
            'invoice_id'  => Invoice::factory(),
            'description' => fake()->sentence(),
            'quantity'    => $quantity,
            'unit_price'  => $unitPrice,
            'amount'      => round($quantity * $unitPrice, 2),
            'sort_order'  => 0,
        ];
    }
}
