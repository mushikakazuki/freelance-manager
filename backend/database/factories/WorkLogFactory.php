<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkLog>
 */
class WorkLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id'  => Project::factory(),
            'user_id'     => User::factory(),
            'worked_date' => fake()->date(),
            'hours'       => fake()->randomFloat(2, 1, 8),
            'description' => fake()->optional()->sentence(),
            'hourly_rate' => fake()->optional()->randomFloat(2, 1000, 10000),
        ];
    }
}
