"use client";

import { useEffect, useMemo, useState } from "react";
import { listInvoices, markInvoicePaid } from "@/lib/services/billing";
import { addAdminHistory } from "@/lib/services/history";

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Array<{id:string;customerName:string;createdAt:string;status:string;total:number;paymentMethod?: 'cash' | 'transfer'}>>([]);
    const [method, setMethod] = useState<'all' | 'cash' | 'transfer' | 'paid' | 'unpaid'>('all');
    const [query, setQuery] = useState('');
    useEffect(() => { listInvoices().then(setInvoices); }, []);

    function exportExcel() {
        // Xuất Excel dạng HTML table để mở bằng Excel
        const head = ["Mã", "Khách", "Tạo lúc", "Trạng thái", "Tổng (VND)"];
        const rows = invoices.map((i) => [i.id, i.customerName, new Date(i.createdAt).toLocaleString(), i.status, i.total.toLocaleString("vi-VN")]);
        const html = `\n            <html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\">\n              <head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Invoices</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>\n              <body><table border=\"1\">\n                <thead><tr>${head.map((h)=>`<th>${h}</th>`).join("")}</tr></thead>\n                <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${String(c)}</td>`).join("")}</tr>`).join("")}</tbody>\n              </table></body></html>`;
        const blob = new Blob([html], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoices_${Date.now()}.xls`;
        a.click();
        URL.revokeObjectURL(url);
        addAdminHistory("Xuất Excel hóa đơn");
    }

    function exportInvoicePDF(id: string) {
        const inv = invoices.find((x) => x.id === id);
        if (!inv) return;
        const w = window.open("", "_blank");
        if (!w) return;
        const itemsRows = inv.items.map(i => `<tr>
            <td style='padding:6px;border:1px solid #e5e7eb'>${i.description}</td>
            <td style='padding:6px;border:1px solid #e5e7eb;text-align:center'>${i.quantity}</td>
            <td style='padding:6px;border:1px solid #e5e7eb;text-align:right'>${i.unitPrice.toLocaleString('vi-VN',{style:'currency',currency:'VND'})}</td>
            <td style='padding:6px;border:1px solid #e5e7eb;text-align:right'>${i.total.toLocaleString('vi-VN',{style:'currency',currency:'VND'})}</td>
        </tr>`).join("");
        const statusText = inv.status==='paid' ? `Đã thanh toán${inv.paymentMethod ? ' – ' + (inv.paymentMethod==='cash'?'Tiền mặt':'Chuyển khoản') : ''}` : inv.status==='unpaid' ? 'Chưa thanh toán' : 'Hủy';
        const noteStatus = inv.status==='unpaid' ? `<div style='margin-top:8px;color:#dc2626'>Lưu ý: Hóa đơn chưa được xác nhận thanh toán.</div>` : '';
        const html = `<!doctype html><html><head><meta charset='utf-8'><title>Hóa đơn ${inv.id}</title>
          <style>
            body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827}
            .row{display:flex;justify-content:space-between;margin:6px 0}
            .title{font-weight:bold}
            .badge{padding:2px 8px;border-radius:12px;font-size:12px;border:1px solid #e5e7eb;background:#f3f4f6}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            h2{margin:0 0 8px 0}
          </style>
          </head><body>
            <h2>Hóa đơn #${inv.id}</h2>
            <div class='row'><div class='title'>Khách</div><div>${inv.customerName}</div></div>
            <div class='row'><div class='title'>Tạo lúc</div><div>${new Date(inv.createdAt).toLocaleString()}</div></div>
            <div class='row'><div class='title'>Trạng thái</div><div class='badge'>${statusText}</div></div>
            ${inv.referenceCode ? `<div class='row'><div class='title'>Mã giao dịch</div><div>${inv.referenceCode}</div></div>` : ''}
            ${noteStatus}
            <table>
              <thead><tr>
                <th style='text-align:left;padding:6px;border:1px solid #e5e7eb;background:#f9fafb'>Dịch vụ</th>
                <th style='text-align:center;padding:6px;border:1px solid #e5e7eb;background:#f9fafb'>SL</th>
                <th style='text-align:right;padding:6px;border:1px solid #e5e7eb;background:#f9fafb'>Đơn giá</th>
                <th style='text-align:right;padding:6px;border:1px solid #e5e7eb;background:#f9fafb'>Thành tiền</th>
              </tr></thead>
              <tbody>${itemsRows}</tbody>
            </table>
            <div class='row' style='margin-top:12px'><div class='title'>Tạm tính</div><div>${inv.subtotal.toLocaleString('vi-VN',{style:'currency',currency:'VND'})}</div></div>
            <div class='row'><div class='title'>Tổng cộng</div><div><b>${inv.total.toLocaleString('vi-VN',{style:'currency',currency:'VND'})}</b></div></div>
            <script>window.onload=function(){window.print();}</script>
          </body></html>`;
        w.document.write(html);
        w.document.close();
        addAdminHistory(`Xuất PDF hóa đơn ${inv.id}`);
    }

    async function markPaid(id: string) {
        const method = (prompt("Phương thức (cash/transfer)") || "cash").toLowerCase() as "cash" | "transfer";
        const ref = method === "transfer" ? prompt("Mã giao dịch (nếu có)") || undefined : undefined;
        const updated = await markInvoicePaid(id, method, ref);
		if (updated) {
			setInvoices((prev) => prev.map((i) => (i.id === id ? updated : i)));
			await addAdminHistory(`Đánh dấu đã thanh toán hóa đơn ${updated.id}`);
		}
	}

    const filtered = invoices.filter((i) => {
        const okMethod = method === 'all' ? true : (method === 'paid' || method === 'unpaid') ? i.status === method : i.paymentMethod === method;
        const okQuery = query ? (i.customerName + i.id).toLowerCase().includes(query.toLowerCase()) : true;
        return okMethod && okQuery;
    });

    return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Tài chính & Hóa đơn</h1>
            <div className="flex gap-3 items-center flex-wrap">
                <button className="rounded px-3 py-2 border" onClick={exportExcel}>Xuất Excel</button>
                <input className="border rounded px-3 py-2" placeholder="Tìm theo tên/mã" value={query} onChange={(e)=>setQuery(e.target.value)} />
                <select className="border rounded px-3 py-2" value={method} onChange={(e)=>setMethod(e.target.value as any)}>
                    <option value="all">Tất cả</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="unpaid">Chưa thanh toán</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                </select>
            </div>
			<div className="overflow-auto rounded-lg border">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							<th className="px-4 py-2">Mã</th>
							<th className="px-4 py-2">Khách</th>
							<th className="px-4 py-2">Tạo lúc</th>
							<th className="px-4 py-2">Trạng thái</th>
							<th className="px-4 py-2">Tổng</th>
						</tr>
					</thead>
					<tbody>
						{filtered.map((inv) => (
							<tr key={inv.id} className="border-t">
								<td className="px-4 py-2 font-mono">{inv.id}</td>
								<td className="px-4 py-2 font-medium">{inv.customerName}</td>
                                <td className="px-4 py-2">{new Date(inv.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-2">
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${inv.status==='paid'?'bg-blue-100 text-blue-700':inv.status==='unpaid'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>
                                        {inv.status==='paid' ? `Đã thanh toán${inv.paymentMethod ? ' – ' + (inv.paymentMethod==='cash'?'Tiền mặt':'Chuyển khoản') : ''}` : inv.status==='unpaid'?'Chờ thanh toán':'Hủy'}
                                    </span>
                                    {inv.status!== 'paid' ? <button className="ml-2 underline" onClick={() => markPaid(inv.id)}>Đánh dấu đã trả</button> : null}
								</td>
                                <td className="px-4 py-2 flex items-center gap-2">
                                    <span>{inv.total.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                                    <button className="underline" onClick={() => exportInvoicePDF(inv.id)}>PDF</button>
                                </td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}


