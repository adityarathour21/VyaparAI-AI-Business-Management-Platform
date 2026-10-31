import React, { useState } from 'react';
import { Order, Business } from '../types';
import { Printer, Share2, X, FileText, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  business: Business | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, business, onClose }) => {
  const [thermalMode, setThermalMode] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!order || !business) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `Namaste! Thank you for shopping at ${business.name}. Your invoice #${order.orderNumber} for ₹${order.totalAmount} is ready. Payment Mode: ${order.paymentMethod}. Have a great day!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-8">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-800">
              Tax Invoice: #{order.orderNumber}
            </span>
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setThermalMode(false)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  !thermalMode ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standard GST A4
              </button>
              <button
                onClick={() => setThermalMode(true)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  thermalMode ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal (POS)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy WhatsApp Message"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Link!' : 'WhatsApp'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
          {thermalMode ? (
            /* Thermal POS Receipt Format (Centered, 58mm style) */
            <div className="max-w-xs mx-auto font-mono text-xs border border-dashed border-slate-300 p-4 rounded bg-slate-50 text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm uppercase">{business.name}</p>
                <p className="text-[10px] text-slate-600">{business.address}, {business.city}</p>
                <p className="text-[10px] text-slate-600">GSTIN: {business.gstin || 'N/A'}</p>
                <p className="text-[10px] text-slate-600">Ph: {business.phone}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill No: {order.orderNumber}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer: {order.customerName}</span>
                  <span>{order.customerPhone || ''}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[11px] pb-1">
                  <span>ITEM</span>
                  <span>QTY x RATE</span>
                  <span>AMT</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] py-0.5">
                    <span className="truncate max-w-[120px]">{item.productName}</span>
                    <span>{item.quantity} x ₹{item.unitPrice}</span>
                    <span>₹{item.total}</span>
                  </div>
                ))}
              </div>

              <div className="py-2 space-y-1 text-right text-[11px] border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax:</span>
                  <span>₹{order.taxAmount}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300 text-slate-900">
                  <span>NET TOTAL:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Payment Mode:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500 space-y-1">
                <p>*** Thank You! Visit Again ***</p>
                <p className="font-sans text-[9px]">Powered by VyaparAI Cloud POS</p>
              </div>
            </div>
          ) : (
            /* Full Standard GST Tax Invoice Format */
            <div className="text-xs space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{business.name}</h2>
                  <p className="text-slate-600 text-xs mt-0.5">{business.address}, {business.city}, {business.state} - {business.pincode}</p>
                  <p className="text-slate-600 text-xs">Phone: {business.phone} | Email: {business.email}</p>
                  <p className="text-slate-900 font-semibold text-xs mt-1">GSTIN: {business.gstin || '08AAACS1429B1ZB'}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs uppercase tracking-wider rounded">
                    TAX INVOICE
                  </span>
                  <p className="font-mono text-sm font-bold text-slate-800 mt-2">#{order.orderNumber}</p>
                  <p className="text-slate-500 text-[11px]">
                    Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Bill To Customer</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{order.customerName}</p>
                  <p className="text-slate-600">{order.customerPhone || 'Walk-in Retail Buyer'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Payment Summary</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{order.paymentMethod}</p>
                  <p className="text-slate-600">Status: <span className="text-emerald-600 font-semibold">{order.paymentStatus}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase bg-slate-100">
                    <th className="py-2 px-3 font-semibold">#</th>
                    <th className="py-2 px-3 font-semibold">Product Description</th>
                    <th className="py-2 px-3 font-semibold text-right">Qty</th>
                    <th className="py-2 px-3 font-semibold text-right">Rate</th>
                    <th className="py-2 px-3 font-semibold text-right">GST %</th>
                    <th className="py-2 px-3 font-semibold text-right">Tax (₹)</th>
                    <th className="py-2 px-3 font-semibold text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {item.productName}
                        {item.sku && <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₹{item.unitPrice}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{item.gstRate}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₹{item.taxAmount}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-1.5 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value (Subtotal):</span>
                    <span className="font-semibold">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (CGST + SGST):</span>
                    <span className="font-semibold">₹{order.taxAmount}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t-2 border-slate-300">
                    <span>Grand Total:</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Signatory & Notes */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                  <p>1. Goods once sold will not be taken back without valid bill.</p>
                  <p>2. Subject to {business.city} jurisdiction only.</p>
                  <p className="text-[10px] text-indigo-600 mt-2">Digitally verified invoice powered by VyaparAI</p>
                </div>
                <div className="text-center">
                  <div className="w-36 h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-400 italic">
                    Authorized Signatory
                  </div>
                  <p className="text-[10px] font-semibold text-slate-700 mt-1">For {business.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
