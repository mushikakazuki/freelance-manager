<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'amount'     => fake()->randomFloat(2, 10000, 500000),
            'tax_rate'   => 10.0,
            'issued_at'  => fake()->date(),
            'due_at'     => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'notes'      => fake()->optional()->sentence(),
        ];
    }
}
