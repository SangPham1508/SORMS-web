import { ENDPOINTS } from "@/lib/config";
import { http } from "@/lib/http";
import type { Invoice } from "@/lib/types";

let store: Invoice[] | null = null;

export async function listInvoices(): Promise<Invoice[]> {
    // return await http<Invoice[]>(ENDPOINTS.billing.invoices());
    if (store) return store;
    store = [
        {
            id: "inv_1",
            customerName: "Nguyen Van A",
            createdAt: new Date().toISOString(),
            status: "unpaid",
            items: [
                // Chỉ tính phí dịch vụ, không tính phí lưu trú
                { description: "Giặt ủi", quantity: 3, unitPrice: 20000, total: 60000 },
                { description: "Bữa sáng", quantity: 2, unitPrice: 50000, total: 100000 },
            ],
            subtotal: 160000,
            tax: 0,
            total: 160000,
        },
    ];
    return store;
}

function uid() { return Math.random().toString(36).slice(2); }

export async function createServiceInvoice(customerName: string, items: Array<{ description: string; quantity: number; unitPrice: number }>): Promise<Invoice> {
    const normalized = items.map((i) => ({ ...i, total: i.quantity * i.unitPrice }));
    const subtotal = normalized.reduce((s, i) => s + i.total, 0);
    const inv: Invoice = {
        id: uid(),
        customerName,
        createdAt: new Date().toISOString(),
        status: "unpaid",
        items: normalized,
        subtotal,
        tax: 0,
        total: subtotal,
    };
    const list = await listInvoices();
    store = [inv, ...list];
    return inv;
}

export async function markInvoicePaid(id: string, method: "cash" | "transfer", referenceCode?: string): Promise<Invoice | null> {
    const list = await listInvoices();
    const idx = list.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], status: "paid", paymentMethod: method, paidAt: new Date().toISOString(), referenceCode };
    return list[idx];
}


