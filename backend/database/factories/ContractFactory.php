<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contract>
 */
class ContractFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id'     => Client::factory(),
            'project_id'    => null,
            'title'         => fake()->sentence(3),
            'hourly_rate'   => fake()->optional()->randomFloat(2, 1000, 10000),
            'monthly_rate'  => null,
            'payment_terms' => fake()->optional()->randomElement([30, 60, 90]),
            'start_date'    => fake()->date(),
            'end_date'      => null,
            'notes'         => fake()->optional()->sentence(),
        ];
    }
}
