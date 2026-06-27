<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id'   => Client::factory(),
            'name'        => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'status'      => 'active',
            'start_date'  => fake()->date(),
            'end_date'    => fake()->optional()->date(),
            'hourly_rate' => fake()->optional()->randomFloat(2, 1000, 10000),
        ];
    }
}
