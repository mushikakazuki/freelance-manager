<?php

namespace Tests\Unit\Models;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Project;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $contract = new Contract();
        $this->assertEquals(
            ['client_id', 'project_id', 'title', 'hourly_rate', 'monthly_rate', 'payment_terms', 'start_date', 'end_date', 'notes'],
            $contract->getFillable()
        );
    }

    public function test_hourly_rate_is_cast_to_float(): void
    {
        $contract = new Contract();
        $this->assertEquals('float', $contract->getCasts()['hourly_rate']);
    }

    public function test_monthly_rate_is_cast_to_float(): void
    {
        $contract = new Contract();
        $this->assertEquals('float', $contract->getCasts()['monthly_rate']);
    }

    public function test_start_date_is_cast_to_date(): void
    {
        $contract = new Contract();
        $this->assertEquals('date', $contract->getCasts()['start_date']);
    }

    public function test_end_date_is_cast_to_date(): void
    {
        $contract = new Contract();
        $this->assertEquals('date', $contract->getCasts()['end_date']);
    }

    public function test_client_relationship_is_belongs_to(): void
    {
        $contract = new Contract();
        $this->assertInstanceOf(BelongsTo::class, $contract->client());
    }

    public function test_project_relationship_is_belongs_to(): void
    {
        $contract = new Contract();
        $this->assertInstanceOf(BelongsTo::class, $contract->project());
    }

    public function test_belongs_to_client(): void
    {
        $client   = Client::factory()->create();
        $contract = Contract::factory()->create(['client_id' => $client->id]);

        $this->assertInstanceOf(Client::class, $contract->client);
        $this->assertEquals($client->id, $contract->client->id);
    }

    public function test_belongs_to_project(): void
    {
        $project  = Project::factory()->create();
        $contract = Contract::factory()->create([
            'client_id'  => $project->client_id,
            'project_id' => $project->id,
        ]);

        $this->assertInstanceOf(Project::class, $contract->project);
        $this->assertEquals($project->id, $contract->project->id);
    }

    public function test_project_is_optional(): void
    {
        $client   = Client::factory()->create();
        $contract = Contract::factory()->create([
            'client_id'  => $client->id,
            'project_id' => null,
        ]);

        $this->assertNull($contract->project);
    }

    public function test_hourly_rate_value_is_float(): void
    {
        $contract = Contract::factory()->create(['hourly_rate' => 3000]);

        $this->assertIsFloat($contract->hourly_rate);
        $this->assertEquals(3000.0, $contract->hourly_rate);
    }

    public function test_monthly_rate_value_is_float(): void
    {
        $contract = Contract::factory()->create(['monthly_rate' => 500000]);

        $this->assertIsFloat($contract->monthly_rate);
        $this->assertEquals(500000.0, $contract->monthly_rate);
    }

    public function test_start_date_is_carbon_instance(): void
    {
        $contract = Contract::factory()->create(['start_date' => '2026-01-01']);

        $this->assertInstanceOf(Carbon::class, $contract->start_date);
        $this->assertEquals('2026-01-01', $contract->start_date->toDateString());
    }

    public function test_end_date_can_be_null(): void
    {
        $contract = Contract::factory()->create(['end_date' => null]);
        $this->assertNull($contract->end_date);
    }

    public function test_monthly_rate_can_be_null(): void
    {
        $contract = Contract::factory()->create([
            'hourly_rate'  => 3000,
            'monthly_rate' => null,
        ]);
        $this->assertNull($contract->monthly_rate);
    }
}
