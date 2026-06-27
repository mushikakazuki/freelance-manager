<?php

namespace Tests\Unit\GraphQL;

use App\GraphQL\Mutations\AuthMutations;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthMutationsTest extends TestCase
{
    use RefreshDatabase;

    private AuthMutations $mutations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mutations = new AuthMutations();
    }

    public function test_register_creates_user_in_database(): void
    {
        $this->mutations->register(null, [
            'name'     => 'テストユーザー',
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->assertDatabaseHas('users', [
            'name'  => 'テストユーザー',
            'email' => 'test@example.com',
        ]);
    }

    public function test_register_returns_token_and_user(): void
    {
        $result = $this->mutations->register(null, [
            'name'     => 'テストユーザー',
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertNotEmpty($result['token']);
        $this->assertInstanceOf(User::class, $result['user']);
    }

    public function test_register_hashes_password(): void
    {
        $this->mutations->register(null, [
            'name'     => 'テストユーザー',
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertNotEquals('password123', $user->password);
    }

    public function test_register_returns_user_with_correct_data(): void
    {
        $result = $this->mutations->register(null, [
            'name'     => 'テストユーザー',
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->assertEquals('テストユーザー', $result['user']->name);
        $this->assertEquals('test@example.com', $result['user']->email);
    }

    public function test_register_creates_personal_access_token(): void
    {
        $this->mutations->register(null, [
            'name'     => 'テストユーザー',
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertCount(1, $user->tokens);
    }

    public function test_login_with_valid_credentials_returns_token_and_user(): void
    {
        User::factory()->create([
            'email'    => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $result = $this->mutations->login(null, [
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertNotEmpty($result['token']);
        $this->assertInstanceOf(User::class, $result['user']);
    }

    public function test_login_with_nonexistent_email_throws_validation_exception(): void
    {
        $this->expectException(ValidationException::class);

        $this->mutations->login(null, [
            'email'    => 'nonexistent@example.com',
            'password' => 'password123',
        ]);
    }

    public function test_login_with_wrong_password_throws_validation_exception(): void
    {
        User::factory()->create([
            'email'    => 'test@example.com',
            'password' => Hash::make('correctpassword'),
        ]);

        $this->expectException(ValidationException::class);

        $this->mutations->login(null, [
            'email'    => 'test@example.com',
            'password' => 'wrongpassword',
        ]);
    }

    public function test_login_validation_exception_contains_email_key(): void
    {
        try {
            $this->mutations->login(null, [
                'email'    => 'nonexistent@example.com',
                'password' => 'password123',
            ]);
            $this->fail('ValidationExceptionがスローされる必要があります');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('email', $e->errors());
        }
    }

    public function test_login_creates_personal_access_token(): void
    {
        $user = User::factory()->create([
            'email'    => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->mutations->login(null, [
            'email'    => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->assertCount(1, $user->fresh()->tokens);
    }

    public function test_logout_returns_true(): void
    {
        $user     = User::factory()->create();
        $newToken = $user->createToken('api-token');

        // currentAccessToken()が返すトークンをセット
        $user->withAccessToken($newToken->accessToken);
        Auth::setUser($user);

        $result = $this->mutations->logout(null, []);

        $this->assertTrue($result);
    }

    public function test_logout_deletes_current_token(): void
    {
        $user     = User::factory()->create();
        $newToken = $user->createToken('api-token');
        $tokenId  = $newToken->accessToken->id;

        $user->withAccessToken($newToken->accessToken);
        Auth::setUser($user);

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $tokenId]);

        $this->mutations->logout(null, []);

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    public function test_logout_does_not_delete_other_tokens(): void
    {
        $user   = User::factory()->create();
        $token1 = $user->createToken('token-1');
        $token2 = $user->createToken('token-2');

        // token1 でログイン中と仮定
        $user->withAccessToken($token1->accessToken);
        Auth::setUser($user);

        $this->mutations->logout(null, []);

        // token1 は削除済み
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token1->accessToken->id]);
        // token2 は残っている
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $token2->accessToken->id]);
    }
}
