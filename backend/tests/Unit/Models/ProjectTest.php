<?php

namespace Tests\Unit\Models;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Task;
use App\Models\WorkLog;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $project = new Project();
        $this->assertEquals(
            ['client_id', 'name', 'description', 'status', 'start_date', 'end_date', 'hourly_rate'],
            $project->getFillable()
        );
    }

    public function test_start_date_is_cast_to_date(): void
    {
        $project = Project::factory()->create(['start_date' => '2026-01-01']);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $project->start_date);
        $this->assertEquals('2026-01-01', $project->start_date->toDateString());
    }

    public function test_end_date_is_cast_to_date(): void
    {
        $project = Project::factory()->create(['end_date' => '2026-12-31']);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $project->end_date);
        $this->assertEquals('2026-12-31', $project->end_date->toDateString());
    }

    public function test_hourly_rate_is_cast_to_float(): void
    {
        $project = Project::factory()->create(['hourly_rate' => 5000]);
        $this->assertIsFloat($project->hourly_rate);
        $this->assertEquals(5000.0, $project->hourly_rate);
    }

    public function test_client_relationship_is_belongs_to(): void
    {
        $project = new Project();
        $this->assertInstanceOf(BelongsTo::class, $project->client());
    }

    public function test_invoices_relationship_is_has_many(): void
    {
        $project = new Project();
        $this->assertInstanceOf(HasMany::class, $project->invoices());
    }

    public function test_work_logs_relationship_is_has_many(): void
    {
        $project = new Project();
        $this->assertInstanceOf(HasMany::class, $project->workLogs());
    }

    public function test_expenses_relationship_is_has_many(): void
    {
        $project = new Project();
        $this->assertInstanceOf(HasMany::class, $project->expenses());
    }

    public function test_tasks_relationship_is_has_many(): void
    {
        $project = new Project();
        $this->assertInstanceOf(HasMany::class, $project->tasks());
    }

    public function test_contracts_relationship_is_has_many(): void
    {
        $project = new Project();
        $this->assertInstanceOf(HasMany::class, $project->contracts());
    }

    public function test_belongs_to_client(): void
    {
        $client  = Client::factory()->create();
        $project = Project::factory()->create(['client_id' => $client->id]);

        $this->assertInstanceOf(Client::class, $project->client);
        $this->assertEquals($client->id, $project->client->id);
    }

    public function test_tasks_are_ordered_by_sort_order(): void
    {
        $project = Project::factory()->create();
        Task::factory()->create(['project_id' => $project->id, 'title' => 'C', 'sort_order' => 3]);
        Task::factory()->create(['project_id' => $project->id, 'title' => 'A', 'sort_order' => 1]);
        Task::factory()->create(['project_id' => $project->id, 'title' => 'B', 'sort_order' => 2]);

        $tasks = $project->tasks;
        $this->assertEquals('A', $tasks[0]->title);
        $this->assertEquals('B', $tasks[1]->title);
        $this->assertEquals('C', $tasks[2]->title);
    }

    public function test_has_many_invoices(): void
    {
        $project = Project::factory()->create();
        Invoice::factory()->count(2)->create(['project_id' => $project->id]);

        $this->assertCount(2, $project->invoices);
    }

    public function test_has_many_work_logs(): void
    {
        $project = Project::factory()->create();
        WorkLog::factory()->count(2)->create(['project_id' => $project->id]);

        $this->assertCount(2, $project->workLogs);
    }

    public function test_has_many_expenses(): void
    {
        $project = Project::factory()->create();
        Expense::factory()->count(2)->create(['project_id' => $project->id]);

        $this->assertCount(2, $project->expenses);
    }

    public function test_has_many_contracts(): void
    {
        $project = Project::factory()->create();
        Contract::factory()->count(2)->create([
            'client_id'  => $project->client_id,
            'project_id' => $project->id,
        ]);

        $this->assertCount(2, $project->contracts);
    }
}
