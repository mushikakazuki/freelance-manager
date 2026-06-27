<?php

namespace Tests\Unit\Models;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Project;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $invoice = new Invoice();
        $this->assertEquals(
            ['project_id', 'invoice_number', 'status', 'amount', 'tax_rate', 'issued_at', 'due_at', 'paid_at', 'notes', 'tax_amount', 'total_amount'],
            $invoice->getFillable()
        );
    }

    public function test_numeric_fields_are_cast_to_float(): void
    {
        $invoice = new Invoice();
        $casts   = $invoice->getCasts();

        $this->assertEquals('float', $casts['amount']);
        $this->assertEquals('float', $casts['tax_rate']);
        $this->assertEquals('float', $casts['tax_amount']);
        $this->assertEquals('float', $casts['total_amount']);
    }

    public function test_date_fields_are_cast(): void
    {
        $invoice = new Invoice();
        $casts   = $invoice->getCasts();

        $this->assertEquals('date', $casts['issued_at']);
        $this->assertEquals('date', $casts['due_at']);
        $this->assertEquals('datetime', $casts['paid_at']);
    }

    public function test_invoice_number_is_auto_generated_on_create(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        $year    = now()->format('Y');

        $this->assertNotEmpty($invoice->invoice_number);
        $this->assertStringStartsWith("INV-{$year}-", $invoice->invoice_number);
    }

    public function test_invoice_number_is_sequential(): void
    {
        $project  = Project::factory()->create();
        $invoice1 = Invoice::factory()->create(['project_id' => $project->id, 'amount' => 10000]);
        $invoice2 = Invoice::factory()->create(['project_id' => $project->id, 'amount' => 20000]);

        $year = now()->format('Y');
        $this->assertEquals("INV-{$year}-0001", $invoice1->invoice_number);
        $this->assertEquals("INV-{$year}-0002", $invoice2->invoice_number);
    }

    public function test_provided_invoice_number_is_not_overwritten(): void
    {
        $invoice = Invoice::factory()->create([
            'invoice_number' => 'CUSTOM-001',
            'amount'         => 10000,
        ]);

        $this->assertEquals('CUSTOM-001', $invoice->invoice_number);
    }

    public function test_default_status_is_draft(): void
    {
        $project = Project::factory()->create();
        $invoice = Invoice::create([
            'project_id' => $project->id,
            'amount'     => 10000,
            'issued_at'  => now()->toDateString(),
            'due_at'     => now()->addDays(30)->toDateString(),
        ]);

        $this->assertEquals('draft', $invoice->fresh()->status);
    }

    public function test_provided_status_is_not_overwritten(): void
    {
        $invoice = Invoice::factory()->create([
            'amount' => 10000,
            'status' => 'sent',
        ]);

        $this->assertEquals('sent', $invoice->status);
    }

    public function test_tax_amount_is_calculated_on_create(): void
    {
        $invoice = Invoice::factory()->create([
            'amount'   => 100000,
            'tax_rate' => 10,
        ]);

        $this->assertEquals(10000, $invoice->tax_amount);
    }

    public function test_total_amount_is_calculated_on_create(): void
    {
        $invoice = Invoice::factory()->create([
            'amount'   => 100000,
            'tax_rate' => 10,
        ]);

        $this->assertEquals(110000, $invoice->total_amount);
    }

    public function test_default_tax_rate_of_10_percent_is_applied_when_not_specified(): void
    {
        $project = Project::factory()->create();
        $invoice = Invoice::create([
            'project_id' => $project->id,
            'amount'     => 100000,
            'issued_at'  => now()->toDateString(),
            'due_at'     => now()->addDays(30)->toDateString(),
        ]);

        $this->assertEquals(10000, $invoice->tax_amount);
        $this->assertEquals(110000, $invoice->total_amount);
    }

    public function test_tax_amount_uses_rounding(): void
    {
        $invoice = Invoice::factory()->create([
            'amount'   => 1000,
            'tax_rate' => 10,
        ]);

        // 1000 * 10 / 100 = 100（端数なし）
        $this->assertEquals(100, $invoice->tax_amount);
    }

    public function test_tax_recalculated_when_amount_is_updated(): void
    {
        $invoice = Invoice::factory()->create([
            'amount'   => 100000,
            'tax_rate' => 10,
        ]);

        $invoice->update(['amount' => 200000]);

        $fresh = $invoice->fresh();
        $this->assertEquals(20000, $fresh->tax_amount);
        $this->assertEquals(220000, $fresh->total_amount);
    }

    public function test_tax_recalculated_when_tax_rate_is_updated(): void
    {
        $invoice = Invoice::factory()->create([
            'amount'   => 100000,
            'tax_rate' => 10,
        ]);

        $invoice->update(['tax_rate' => 8]);

        $fresh = $invoice->fresh();
        $this->assertEquals(8000, $fresh->tax_amount);
        $this->assertEquals(108000, $fresh->total_amount);
    }

    public function test_tax_not_recalculated_on_unrelated_field_update(): void
    {
        $invoice = Invoice::factory()->create([
            'amount'   => 100000,
            'tax_rate' => 10,
        ]);

        $originalTaxAmount   = $invoice->tax_amount;
        $originalTotalAmount = $invoice->total_amount;

        $invoice->update(['notes' => '備考を更新しました']);

        $fresh = $invoice->fresh();
        $this->assertEquals($originalTaxAmount, $fresh->tax_amount);
        $this->assertEquals($originalTotalAmount, $fresh->total_amount);
    }

    public function test_project_relationship_is_belongs_to(): void
    {
        $invoice = new Invoice();
        $this->assertInstanceOf(BelongsTo::class, $invoice->project());
    }

    public function test_invoice_items_relationship_is_has_many(): void
    {
        $invoice = new Invoice();
        $this->assertInstanceOf(HasMany::class, $invoice->invoiceItems());
    }

    public function test_belongs_to_project(): void
    {
        $project = Project::factory()->create();
        $invoice = Invoice::factory()->create(['project_id' => $project->id]);

        $this->assertInstanceOf(Project::class, $invoice->project);
        $this->assertEquals($project->id, $invoice->project->id);
    }

    public function test_has_many_invoice_items(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        InvoiceItem::factory()->count(3)->create(['invoice_id' => $invoice->id]);

        $this->assertCount(3, $invoice->invoiceItems);
    }

    public function test_invoice_items_are_ordered_by_sort_order(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        InvoiceItem::factory()->create([
            'invoice_id'  => $invoice->id,
            'description' => 'C',
            'sort_order'  => 3,
            'quantity'    => 1,
            'unit_price'  => 1000,
            'amount'      => 1000,
        ]);
        InvoiceItem::factory()->create([
            'invoice_id'  => $invoice->id,
            'description' => 'A',
            'sort_order'  => 1,
            'quantity'    => 1,
            'unit_price'  => 1000,
            'amount'      => 1000,
        ]);
        InvoiceItem::factory()->create([
            'invoice_id'  => $invoice->id,
            'description' => 'B',
            'sort_order'  => 2,
            'quantity'    => 1,
            'unit_price'  => 1000,
            'amount'      => 1000,
        ]);

        $items = $invoice->invoiceItems;
        $this->assertEquals('A', $items[0]->description);
        $this->assertEquals('B', $items[1]->description);
        $this->assertEquals('C', $items[2]->description);
    }
}
