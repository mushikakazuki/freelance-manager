<?php

namespace Tests\Unit\Models;

use App\Models\Client;
use App\Models\User;
use App\Models\WorkLog;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $user = new User();
        $this->assertEquals(['name', 'email', 'password'], $user->getFillable());
    }

    public function test_password_and_remember_token_are_hidden(): void
    {
        $user = new User();
        $this->assertContains('password', $user->getHidden());
        $this->assertContains('remember_token', $user->getHidden());
    }

    public function test_clients_relationship_is_has_many(): void
    {
        $user = new User();
        $this->assertInstanceOf(HasMany::class, $user->clients());
    }

    public function test_work_logs_relationship_is_has_many(): void
    {
        $user = new User();
        $this->assertInstanceOf(HasMany::class, $user->workLogs());
    }

    public function test_has_many_clients(): void
    {
        $user = User::factory()->create();
        Client::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->clients);
        $this->assertInstanceOf(Client::class, $user->clients->first());
    }

    public function test_has_many_work_logs(): void
    {
        $user = User::factory()->create();
        WorkLog::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->workLogs);
        $this->assertInstanceOf(WorkLog::class, $user->workLogs->first());
    }

    public function test_clients_returns_only_own_clients(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Client::factory()->count(2)->create(['user_id' => $user1->id]);
        Client::factory()->count(3)->create(['user_id' => $user2->id]);

        $this->assertCount(2, $user1->clients);
        $this->assertCount(3, $user2->clients);
    }

    public function test_email_verified_at_is_cast_to_datetime(): void
    {
        $user = User::factory()->create();
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->email_verified_at);
    }
}
