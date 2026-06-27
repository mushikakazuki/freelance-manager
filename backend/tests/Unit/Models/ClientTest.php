<?php

namespace Tests\Unit\Models;

use App\Models\Client;
use App\Models\Contract;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $client = new Client();
        $this->assertEquals(
            ['user_id', 'name', 'email', 'phone', 'address', 'notes'],
            $client->getFillable()
        );
    }

    public function test_user_relationship_is_belongs_to(): void
    {
        $client = new Client();
        $this->assertInstanceOf(BelongsTo::class, $client->user());
    }

    public function test_projects_relationship_is_has_many(): void
    {
        $client = new Client();
        $this->assertInstanceOf(HasMany::class, $client->projects());
    }

    public function test_contracts_relationship_is_has_many(): void
    {
        $client = new Client();
        $this->assertInstanceOf(HasMany::class, $client->contracts());
    }

    public function test_belongs_to_user(): void
    {
        $user   = User::factory()->create();
        $client = Client::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $client->user);
        $this->assertEquals($user->id, $client->user->id);
    }

    public function test_has_many_projects(): void
    {
        $client = Client::factory()->create();
        Project::factory()->count(2)->create(['client_id' => $client->id]);

        $this->assertCount(2, $client->projects);
        $this->assertInstanceOf(Project::class, $client->projects->first());
    }

    public function test_has_many_contracts(): void
    {
        $client = Client::factory()->create();
        Contract::factory()->count(2)->create(['client_id' => $client->id]);

        $this->assertCount(2, $client->contracts);
        $this->assertInstanceOf(Contract::class, $client->contracts->first());
    }

    public function test_can_be_created_with_minimal_fields(): void
    {
        $user   = User::factory()->create();
        $client = Client::factory()->create([
            'user_id' => $user->id,
            'name'    => '株式会社テスト',
            'email'   => null,
            'phone'   => null,
            'address' => null,
            'notes'   => null,
        ]);

        $this->assertDatabaseHas('clients', ['name' => '株式会社テスト']);
    }
}
