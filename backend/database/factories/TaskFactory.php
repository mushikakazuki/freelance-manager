<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id'   => Project::factory(),
            'title'        => fake()->sentence(3),
            'description'  => fake()->optional()->paragraph(),
            'status'       => 'todo',
            'priority'     => 'medium',
            'due_date'     => fake()->optional()->date(),
            'completed_at' => null,
            'sort_order'   => 0,
        ];
    }
}
