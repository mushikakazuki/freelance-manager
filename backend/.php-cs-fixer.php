<?php

$finder = PhpCsFixer\Finder::create()
    ->in([
        __DIR__ . '/app',
        __DIR__ . '/config',
        __DIR__ . '/database',
        __DIR__ . '/routes',
        __DIR__ . '/tests',
    ])
    ->name('*.php')
    ->notName('*.blade.php')
    ->ignoreDotFiles(true)
    ->ignoreVCS(true);

return (new PhpCsFixer\Config())
    ->setRules([
        // PSR-12 に準拠する
        '@PSR12'                            => true,
        'array_syntax'                      => ['syntax' => 'short'],
        'ordered_imports'                   => ['sort_algorithm' => 'alpha'],
        'no_unused_imports'                 => true,
        'trailing_comma_in_multiline'       => true,
        'binary_operator_spaces'            => true,
        'blank_line_before_statement'       => [
            'statements' => ['break', 'continue', 'declare', 'return', 'throw', 'try'],
        ],
        'method_argument_space'             => [
            'on_multiline'                     => 'ensure_fully_multiline',
            'keep_multiple_spaces_after_comma' => true,
        ],
        'single_trait_insert_per_statement' => true,
    ])
    ->setFinder($finder)
    ->setLineEnding("\n");
