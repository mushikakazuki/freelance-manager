<?php

namespace Tests\Unit\Models;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceItemTest extends TestCase
{
    use RefreshDatabase;

    public function test_fillable_attributes(): void
    {
        $item = new InvoiceItem();
        $this->assertEquals(
            ['invoice_id', 'description', 'quantity', 'unit_price', 'amount', 'sort_order'],
            $item->getFillable()
        );
    }

    public function test_numeric_fields_are_cast_to_float(): void
    {
        $item  = new InvoiceItem();
        $casts = $item->getCasts();

        $this->assertEquals('float', $casts['quantity']);
        $this->assertEquals('float', $casts['unit_price']);
        $this->assertEquals('float', $casts['amount']);
    }

    public function test_invoice_relationship_is_belongs_to(): void
    {
        $item = new InvoiceItem();
        $this->assertInstanceOf(BelongsTo::class, $item->invoice());
    }

    public function test_belongs_to_invoice(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        $item    = InvoiceItem::factory()->create(['invoice_id' => $invoice->id]);

        $this->assertInstanceOf(Invoice::class, $item->invoice);
        $this->assertEquals($invoice->id, $item->invoice->id);
    }

    public function test_quantity_is_cast_to_float(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        $item    = InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'quantity'   => 3,
            'unit_price' => 5000,
            'amount'     => 15000,
        ]);

        $this->assertIsFloat($item->quantity);
        $this->assertEquals(3.0, $item->quantity);
    }

    public function test_unit_price_is_cast_to_float(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        $item    = InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'quantity'   => 1,
            'unit_price' => 50000,
            'amount'     => 50000,
        ]);

        $this->assertIsFloat($item->unit_price);
        $this->assertEquals(50000.0, $item->unit_price);
    }

    public function test_amount_is_cast_to_float(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        $item    = InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'quantity'   => 2,
            'unit_price' => 5000,
            'amount'     => 10000,
        ]);

        $this->assertIsFloat($item->amount);
        $this->assertEquals(10000.0, $item->amount);
    }

    public function test_description_can_be_null(): void
    {
        $invoice = Invoice::factory()->create(['amount' => 10000]);
        $item    = InvoiceItem::factory()->create([
            'invoice_id'  => $invoice->id,
            'description' => null,
            'quantity'    => 1,
            'unit_price'  => 1000,
            'amount'      => 1000,
        ]);

        $this->assertNull($item->description);
    }
}
