<?php

namespace Tests\Unit\Models;

use App\Models\Project;
use App\Models\User;
use App\Models\WorkLog;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class WorkLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $workLog = new WorkLog();
        $this->assertEquals(
            ['project_id', 'user_id', 'worked_date', 'hours', 'description', 'hourly_rate'],
            $workLog->getFillable()
        );
    }

    public function test_worked_date_is_cast_to_date(): void
    {
        $workLog = new WorkLog();
        $this->assertEquals('date', $workLog->getCasts()['worked_date']);
    }

    public function test_hours_is_cast_to_float(): void
    {
        $workLog = new WorkLog();
        $this->assertEquals('float', $workLog->getCasts()['hours']);
    }

    public function test_hourly_rate_is_cast_to_float(): void
    {
        $workLog = new WorkLog();
        $this->assertEquals('float', $workLog->getCasts()['hourly_rate']);
    }

    public function test_project_relationship_is_belongs_to(): void
    {
        $workLog = new WorkLog();
        $this->assertInstanceOf(BelongsTo::class, $workLog->project());
    }

    public function test_user_relationship_is_belongs_to(): void
    {
        $workLog = new WorkLog();
        $this->assertInstanceOf(BelongsTo::class, $workLog->user());
    }

    public function test_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $workLog = WorkLog::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $workLog->project);
        $this->assertEquals($project->id, $workLog->project->id);
    }

    public function test_belongs_to_user(): void
    {
        $user    = User::factory()->create();
        $workLog = WorkLog::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $workLog->user);
        $this->assertEquals($user->id, $workLog->user->id);
    }

    public function test_worked_date_is_carbon_instance(): void
    {
        $workLog = WorkLog::factory()->create(['worked_date' => '2026-06-27']);

        $this->assertInstanceOf(Carbon::class, $workLog->worked_date);
        $this->assertEquals('2026-06-27', $workLog->worked_date->toDateString());
    }

    public function test_hours_value_is_float(): void
    {
        $workLog = WorkLog::factory()->create(['hours' => 8]);

        $this->assertIsFloat($workLog->hours);
        $this->assertEquals(8.0, $workLog->hours);
    }

    public function test_hourly_rate_value_is_float(): void
    {
        $workLog = WorkLog::factory()->create(['hourly_rate' => 3000]);

        $this->assertIsFloat($workLog->hourly_rate);
        $this->assertEquals(3000.0, $workLog->hourly_rate);
    }

    public function test_description_can_be_null(): void
    {
        $workLog = WorkLog::factory()->create(['description' => null]);

        $this->assertNull($workLog->description);
    }

    public function test_hourly_rate_can_be_null(): void
    {
        $workLog = WorkLog::factory()->create(['hourly_rate' => null]);

        $this->assertNull($workLog->hourly_rate);
    }
}
