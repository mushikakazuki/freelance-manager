<?php

namespace Tests\Unit\Models;

use App\Models\Expense;
use App\Models\Project;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ExpenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $expense = new Expense();
        $this->assertEquals(
            ['project_id', 'category', 'description', 'amount', 'incurred_at', 'receipt_url'],
            $expense->getFillable()
        );
    }

    public function test_amount_is_cast_to_float(): void
    {
        $expense = new Expense();
        $this->assertEquals('float', $expense->getCasts()['amount']);
    }

    public function test_incurred_at_is_cast_to_date(): void
    {
        $expense = new Expense();
        $this->assertEquals('date', $expense->getCasts()['incurred_at']);
    }

    public function test_project_relationship_is_belongs_to(): void
    {
        $expense = new Expense();
        $this->assertInstanceOf(BelongsTo::class, $expense->project());
    }

    public function test_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $expense = Expense::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $expense->project);
        $this->assertEquals($project->id, $expense->project->id);
    }

    public function test_amount_value_is_float(): void
    {
        $expense = Expense::factory()->create(['amount' => 5000]);

        $this->assertIsFloat($expense->amount);
        $this->assertEquals(5000.0, $expense->amount);
    }

    public function test_incurred_at_is_carbon_instance(): void
    {
        $expense = Expense::factory()->create(['incurred_at' => '2026-06-01']);

        $this->assertInstanceOf(Carbon::class, $expense->incurred_at);
        $this->assertEquals('2026-06-01', $expense->incurred_at->toDateString());
    }

    public function test_category_transportation(): void
    {
        $expense = Expense::factory()->create(['category' => 'transportation']);
        $this->assertEquals('transportation', $expense->category);
    }

    public function test_category_supplies(): void
    {
        $expense = Expense::factory()->create(['category' => 'supplies']);
        $this->assertEquals('supplies', $expense->category);
    }

    public function test_category_outsourcing(): void
    {
        $expense = Expense::factory()->create(['category' => 'outsourcing']);
        $this->assertEquals('outsourcing', $expense->category);
    }

    public function test_category_other(): void
    {
        $expense = Expense::factory()->create(['category' => 'other']);
        $this->assertEquals('other', $expense->category);
    }

    public function test_receipt_url_can_be_null(): void
    {
        $expense = Expense::factory()->create(['receipt_url' => null]);
        $this->assertNull($expense->receipt_url);
    }
}
