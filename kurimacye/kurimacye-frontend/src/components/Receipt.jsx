import { useRef, useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

export default function Receipt({ order, seller, onClose, onPrint }) {
    const receiptRef = useRef(null);
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await axios.get('/site-settings/public');
                if (res.data.success && res.data.data.logo) {
                    setLogo(res.data.data.logo);
                }
            } catch (err) {
            }
        };
        fetchLogo();
    }, []);

    const handlePrint = () => {
        const printContent = receiptRef.current.innerHTML;
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt - ${order.publicId}</title>
                <style>
                    @page { margin: 0; }
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 12px;
                        width: 80mm;
                        margin: 0 auto;
                        padding: 8px;
                        color: #000;
                    }
                    /* Map Tailwind classes for the print window */
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .text-lg { font-size: 16px; }
                    .text-sm { font-size: 13px; }
                    .text-xs { font-size: 10px; }
                    .font-bold { font-weight: bold; }
                    .font-mono { font-family: 'Courier New', monospace; }
                    .italic { font-style: italic; }
                    .mb-4 { margin-bottom: 12px; }
                    .mb-2 { margin-bottom: 6px; }
                    .mt-1 { margin-top: 3px; }
                    .mt-2 { margin-top: 6px; }
                    .mt-6 { margin-top: 18px; }
                    .my-3 { margin: 8px 0; }
                    .flex { display: flex; }
                    .justify-between { justify-content: space-between; }
                    .w-full { width: 100%; }
                    
                    /* Divider styling */
                    .border-t { border-top: 1px solid #000; }
                    .border-dashed { border-style: dashed; }
                    
                    /* Table styling */
                    table { width: 100%; border-collapse: collapse; }
                    td { vertical-align: top; }
                    
                    /* SDC Thermal box rules */
                    .sdc-box {
                        margin-top: 8px;
                        margin-bottom: 8px;
                        padding: 6px;
                        border: 1px dashed #000;
                        font-size: 9px;
                        font-family: 'Courier New', monospace;
                        text-align: center;
                    }
                    .sdc-title {
                        font-weight: bold;
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 2px;
                        margin-bottom: 4px;
                    }
                    .sdc-row {
                        display: flex;
                        justify-content: space-between;
                    }
                    .sdc-qr {
                        display: block;
                        margin: 6px auto 0;
                        width: 75px;
                        height: 75px;
                    }
                    .break-all {
                        word-break: break-all;
                    }
                    
                    img { max-height: 45px; display: block; margin: 0 auto 6px; }

                    @media print {
                        body { width: 72mm; margin: 0; padding: 4mm; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    ${printContent}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const formatDate = (date) => {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return new Date().toLocaleString('en-RW');
            return d.toLocaleString('en-RW', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return new Date().toLocaleString('en-RW');
        }
    };

    const formatDashed = (str) => {
        if (!str) return '';
        return str.replace(/(.{4})/g, '$1-').replace(/-$/, '');
    };

    const subtotal = order.subtotal || order.totals?.subtotal || 0;
    const grandTotal = order.grandTotal || order.totals?.grandTotal || 0;
    const tax = order.tax || order.totals?.tax || 0;
    const paymentMethod = order.paymentMethod || order.payment?.method || 'CASH';

    // Group items by seller
    const groups = {};
    order.items?.forEach(item => {
        const itemSeller = item.product?.seller || seller || {
            id: item.sellerId || 'unknown',
            storeName: 'Kuri Macye Merchant',
            storeAddress: 'Gicumbi, Byumba',
            rraTin: '123456789',
            rraSdcId: 'SDC007001254',
            rraMrcNo: 'WIS01001254'
        };
        const sellerId = itemSeller.id || itemSeller.rraTin || 'unknown';
        if (!groups[sellerId]) {
            groups[sellerId] = {
                seller: itemSeller,
                items: []
            };
        }
        groups[sellerId].items.push(item);
    });

    const sellerGroups = Object.values(groups);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
                <div className="p-6 overflow-y-auto" ref={receiptRef}>
                    {/* Header */}
                    <div className="text-center mb-4">
                        {logo && (
                            <img
                                src={logo}
                                alt="Logo"
                                className="h-12 mx-auto mb-2 object-contain"
                                style={{ maxHeight: '50px' }}
                            />
                        )}
                        <div className="text-lg font-bold text-gray-900">KURI MACYE MARKETPLACE</div>
                        <div className="text-xs text-gray-500 mt-0.5">Unified Payment Receipt</div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-3"></div>

                    {/* Meta */}
                    <div className="text-xs text-gray-600 space-y-0.5 font-mono">
                        <div>Date: {formatDate(order.createdAt)}</div>
                        <div>Receipt: {order.publicId}</div>
                        <div>Cashier: {order.cashierName || 'System'}</div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-3"></div>

                    {/* Grouped Items & SDC Blocks */}
                    {sellerGroups.map((group, index) => {
                        const firstItem = group.items[0];
                        const hasEbm = firstItem && firstItem.ebmRcptNo;
                        return (
                            <div key={index} className="mb-4">
                                <div className="font-mono text-[11px] font-bold text-gray-900 border-b border-dashed border-gray-200 pb-1 mb-1.5 uppercase">
                                    Merchant: {group.seller.storeName || group.seller.name || 'Seller'}
                                    {group.seller.rraTin && (
                                        <div className="text-[9px] font-normal text-gray-500 lowercase mt-0.5">
                                            tin: {group.seller.rraTin} {group.seller.storeAddress ? `| ${group.seller.storeAddress}` : ''}
                                        </div>
                                    )}
                                </div>

                                <table className="w-full text-xs font-mono mb-2">
                                    <tbody>
                                        {group.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="py-0.5 pr-2">{item.productName || item.name}</td>
                                                <td className="py-0.5 px-1 text-center">x{item.quantity}</td>
                                                <td className="py-0.5 pl-2 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* RRA SDC Receipt block for this seller */}
                                {hasEbm && (
                                    <div className="sdc-box">
                                        <div className="sdc-title">AMAKURU YA SDC / SDC INFO</div>
                                        <div className="sdc-row"><span>SDC ID:</span><span className="font-bold">{group.seller.rraSdcId || firstItem.product?.seller?.rraSdcId || 'SDC007001254'}</span></div>
                                        <div className="sdc-row"><span>RECEIPT NO:</span><span className="font-bold">{firstItem.ebmRcptNo}</span></div>
                                        <div className="sdc-row"><span>DATE:</span><span>{formatDate(firstItem.ebmDate || order.createdAt)}</span></div>
                                        <div className="mt-1 text-[8px] text-left break-all">
                                            <div className="font-bold">INTERNAL DATA:</div>
                                            <div>{formatDashed(firstItem.ebmInternalData)}</div>
                                            <div className="font-bold mt-0.5">RECEIPT SIGNATURE:</div>
                                            <div>{formatDashed(firstItem.ebmSignature)}</div>
                                        </div>
                                        {firstItem.ebmQrCode && (
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(firstItem.ebmQrCode)}`}
                                                alt="RRA QR Code"
                                                className="sdc-qr"
                                            />
                                        )}
                                    </div>
                                )}

                                {index < sellerGroups.length - 1 && (
                                    <div className="border-t border-dashed border-gray-300 my-3"></div>
                                )}
                            </div>
                        );
                    })}

                    <div className="border-t border-dashed border-gray-300 my-3"></div>

                    {/* Totals */}
                    <div className="space-y-1 font-mono text-xs">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>RWF {subtotal.toLocaleString()}</span>
                        </div>
                        {order.shippingCost > 0 && (
                            <div className="flex justify-between">
                                <span>Delivery Fee:</span>
                                <span>RWF {order.shippingCost.toLocaleString()}</span>
                            </div>
                        )}
                        {order.discount > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Discount:</span>
                                <span>- RWF {order.discount.toLocaleString()}</span>
                            </div>
                        )}
                        {tax > 0 && (
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>RWF {tax.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-gray-900 mt-2 border-t border-dashed border-gray-300 pt-1">
                            <span>TOTAL PAID:</span>
                            <span>RWF {grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 my-3"></div>

                    {/* Payment info */}
                    <div className="text-xs text-gray-600 font-mono space-y-0.5">
                        <div>Payment Method: {paymentMethod.toUpperCase()}</div>
                        {paymentMethod.toLowerCase() === 'cash' && order.cashReceived && (
                            <>
                                <div>Cash Received: RWF {order.cashReceived.toLocaleString()}</div>
                                <div>Change: RWF {(order.cashReceived - grandTotal).toLocaleString()}</div>
                            </>
                        )}
                    </div>

                    <div className="text-center mt-6 text-xs text-gray-400 italic font-mono">
                        ~ Umusoro wubaka igihugu ~<br />
                        Thank you for shopping at Kuri Macye!
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-lg flex gap-3">
                    <button
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                        onClick={handlePrint}
                    >
                        <span>🖨️</span> Print Receipt
                    </button>
                    <button
                        className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
