<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id'  => Project::factory(),
            'category'    => fake()->randomElement(['transportation', 'supplies', 'outsourcing', 'other']),
            'description' => fake()->sentence(),
            'amount'      => fake()->randomFloat(2, 100, 100000),
            'incurred_at' => fake()->date(),
            'receipt_url' => fake()->optional()->url(),
        ];
    }
}
