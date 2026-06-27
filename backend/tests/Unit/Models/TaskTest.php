<?php

namespace Tests\Unit\Models;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $task = new Task();
        $this->assertEquals(
            ['project_id', 'title', 'description', 'status', 'priority', 'due_date', 'completed_at', 'sort_order'],
            $task->getFillable()
        );
    }

    public function test_due_date_is_cast_to_date(): void
    {
        $task = new Task();
        $this->assertEquals('date', $task->getCasts()['due_date']);
    }

    public function test_completed_at_is_cast_to_datetime(): void
    {
        $task = new Task();
        $this->assertEquals('datetime', $task->getCasts()['completed_at']);
    }

    public function test_project_relationship_is_belongs_to(): void
    {
        $task = new Task();
        $this->assertInstanceOf(BelongsTo::class, $task->project());
    }

    public function test_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $task    = Task::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $task->project);
        $this->assertEquals($project->id, $task->project->id);
    }

    public function test_due_date_is_carbon_instance(): void
    {
        $project = Project::factory()->create();
        $task    = Task::factory()->create([
            'project_id' => $project->id,
            'due_date'   => '2026-12-31',
        ]);

        $this->assertInstanceOf(Carbon::class, $task->due_date);
        $this->assertEquals('2026-12-31', $task->due_date->toDateString());
    }

    public function test_completed_at_is_carbon_instance(): void
    {
        $project = Project::factory()->create();
        $task    = Task::factory()->create([
            'project_id'   => $project->id,
            'completed_at' => '2026-06-27 10:00:00',
        ]);

        $this->assertInstanceOf(Carbon::class, $task->completed_at);
    }

    public function test_status_defaults_to_todo_from_db(): void
    {
        $project = Project::factory()->create();
        $task    = Task::create([
            'project_id' => $project->id,
            'title'      => 'テストタスク',
        ]);

        $this->assertEquals('todo', $task->fresh()->status);
    }

    public function test_priority_defaults_to_medium_from_db(): void
    {
        $project = Project::factory()->create();
        $task    = Task::create([
            'project_id' => $project->id,
            'title'      => 'テストタスク',
        ]);

        $this->assertEquals('medium', $task->fresh()->priority);
    }

    public function test_status_can_be_set_to_in_progress(): void
    {
        $task = Task::factory()->create(['status' => 'in_progress']);
        $this->assertEquals('in_progress', $task->status);
    }

    public function test_status_can_be_set_to_done(): void
    {
        $task = Task::factory()->create([
            'status'       => 'done',
            'completed_at' => now(),
        ]);
        $this->assertEquals('done', $task->status);
    }

    public function test_priority_can_be_set_to_high(): void
    {
        $task = Task::factory()->create(['priority' => 'high']);
        $this->assertEquals('high', $task->priority);
    }

    public function test_priority_can_be_set_to_low(): void
    {
        $task = Task::factory()->create(['priority' => 'low']);
        $this->assertEquals('low', $task->priority);
    }
}
