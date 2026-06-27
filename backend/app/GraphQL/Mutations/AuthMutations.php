<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * 認証関連の GraphQL ミューテーション
 */
class AuthMutations
{
    /**
     * ユーザー登録処理
     *
     * @param  mixed  $root
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     */
    public function register(mixed $root, array $args): array
    {
        // ユーザーを作成する
        $user = User::create([
            'name'     => $args['name'],
            'email'    => $args['email'],
            'password' => Hash::make($args['password']),
        ]);

        // API トークンを生成する
        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'token' => $token,
            'user'  => $user,
        ];
    }

    /**
     * ログイン処理
     *
     * @param  mixed  $root
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    public function login(mixed $root, array $args): array
    {
        $user = User::where('email', $args['email'])->first();

        if (! $user || ! Hash::check($args['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'メールアドレスまたはパスワードが正しくありません。',
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'token' => $token,
            'user'  => $user,
        ];
    }

    /**
     * ログアウト処理
     *
     * @param  mixed  $root
     * @param  array<string, mixed>  $args
     */
    public function logout(mixed $root, array $args): bool
    {
        // 現在のトークンを削除する
        Auth::user()->currentAccessToken()->delete();

        return true;
    }
}
