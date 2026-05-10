const fs = require('fs');
const path = require('path');

const applyToPos = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add state for Abonnés
    const abonneStates = `
    const [clientType, setClientType] = useState("normal"); // "normal" or "abonne"
    const [abonnes, setAbonnes] = useState([]);
    const [selectedAbonne, setSelectedAbonne] = useState(null);
    const [showAbonneSelectModal, setShowAbonneSelectModal] = useState(false);
    const [showAbonneSplitModal, setShowAbonneSplitModal] = useState(false);
    const [abonneUpfrontCash, setAbonneUpfrontCash] = useState("");

    const fetchAbonnes = async () => {
        try {
            const res = await axios.get("/abonnes");
            if (res.data.success) {
                setAbonnes(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch abonnes");
        }
    };

    useEffect(() => {
        fetchAbonnes();
    }, []);

    const handleAbonneCheckout = async () => {
        if (!selectedAbonne) return alert("Select an Abonné first");
        if (cart.length === 0) return;
        
        setProcessing(true);
        try {
            const res = await axios.post("/orders/pos", {
                items: cart.map((item) => ({
                    product: item._id,
                    quantity: item.quantity,
                })),
                paymentMethod: "client_abonne",
                abonneId: selectedAbonne._id,
                upfrontCashPaid: Number(abonneUpfrontCash) || 0
            });

            showSuccessNotification("Abonné Sale Recorded!");
            setShowAbonneSplitModal(false);
            setAbonneUpfrontCash("");
            setCart([]);
            fetchProducts();
            
            // Optionally clear selected abonne to force re-selection for next order
            // setSelectedAbonne(null);
            // setClientType("normal");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to process sale");
        } finally {
            setProcessing(false);
        }
    };
`;

    if (!content.includes('clientType, setClientType')) {
        content = content.replace(
            /const \[shiftReport, setShiftReport\] = useState\(null\);/,
            `const [shiftReport, setShiftReport] = useState(null);\n${abonneStates}`
        );
    }

    // 2. Add Select Client / Current Sale header to the Right Sidebar
    const cartHeaderTarget = `<div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-charcoal-900 dark:text-white flex items-center gap-2">
                                <FaShoppingCart /> Current Sale
                            </h2>`;
    const cartHeaderReplacement = `<div className="flex flex-col mb-6 gap-3">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black text-charcoal-900 dark:text-white flex items-center gap-2">
                                    <FaShoppingCart /> Current Sale
                                </h2>
                            </div>
                            
                            {/* Client Type Selector */}
                            <div className="flex bg-gray-100 dark:bg-charcoal-700 p-1 rounded-xl">
                                <button 
                                    onClick={() => { setClientType("normal"); setSelectedAbonne(null); }}
                                    className={\`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all \${clientType === "normal" ? "bg-white dark:bg-charcoal-600 text-terracotta-600 shadow-sm" : "text-gray-500"}\`}
                                >
                                    Normal Client
                                </button>
                                <button 
                                    onClick={() => { setClientType("abonne"); setShowAbonneSelectModal(true); }}
                                    className={\`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all \${clientType === "abonne" ? "bg-white dark:bg-charcoal-600 text-terracotta-600 shadow-sm" : "text-gray-500"}\`}
                                >
                                    Client Abonné
                                </button>
                            </div>
                            
                            {clientType === "abonne" && selectedAbonne && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-3 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-500 font-bold uppercase">Abonné Selected</p>
                                        <p className="text-sm font-black text-charcoal-900 dark:text-white">{selectedAbonne.name}</p>
                                    </div>
                                    <button onClick={() => setShowAbonneSelectModal(true)} className="text-xs text-blue-600 hover:underline font-bold">Change</button>
                                </div>
                            )}
                        </div>`;
    
    if (!content.includes('Client Type Selector')) {
        content = content.replace(cartHeaderTarget, cartHeaderReplacement);
    }

    // 3. Override Checkout Buttons
    const checkoutButtonsTarget = `<div className="flex gap-3">
                                <button
                                    onClick={() => handleCheckout("cash")}
                                    disabled={processing}
                                    className="flex-1 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    <FaMoneyBillWave className="text-xl" />
                                    <span className="text-sm">Cash</span>
                                </button>
                                <button
                                    onClick={initiateMomoPayment}
                                    disabled={processing}
                                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    <FaMobileAlt className="text-xl" />
                                    <span className="text-sm">MoMo</span>
                                </button>
                            </div>`;
    
    const checkoutButtonsReplacement = `{clientType === "normal" ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCheckout("cash")}
                                    disabled={processing}
                                    className="flex-1 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    <FaMoneyBillWave className="text-xl" />
                                    <span className="text-sm">Cash</span>
                                </button>
                                <button
                                    onClick={initiateMomoPayment}
                                    disabled={processing}
                                    className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    <FaMobileAlt className="text-xl" />
                                    <span className="text-sm">MoMo</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if(!selectedAbonne) return alert("Select an Abonné first");
                                        setShowAbonneSplitModal(true);
                                    }}
                                    disabled={processing || !selectedAbonne}
                                    className="w-full py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-50"
                                >
                                    <FaMoneyBillWave className="text-xl" />
                                    <span className="text-sm">Checkout Abonné (Tab)</span>
                                </button>
                            </div>
                        )}`;

    if (!content.includes('Checkout Abonné (Tab)')) {
        content = content.replace(checkoutButtonsTarget, checkoutButtonsReplacement);
    }

    // 4. Modals for Abonné
    const abonneModals = `
            {/* Abonné Modals */}
            {showAbonneSelectModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-black text-charcoal-900 dark:text-white">Select Client Abonné</h2>
                            <button onClick={() => { setShowAbonneSelectModal(false); if(!selectedAbonne) setClientType("normal"); }} className="text-gray-500"><FaTimes /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                            {abonnes.map(client => (
                                <button 
                                    key={client._id}
                                    onClick={() => { setSelectedAbonne(client); setShowAbonneSelectModal(false); }}
                                    className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-charcoal-700 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20 hover:border-terracotta-200 transition-all flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold text-charcoal-900 dark:text-white">{client.name}</p>
                                        <p className="text-xs text-gray-500">{client.phone}</p>
                                    </div>
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Debt: {client.totalDebt} RWF</span>
                                </button>
                            ))}
                            {abonnes.length === 0 && <p className="text-center text-gray-500 py-4">No clients found. Add them in the Admin section.</p>}
                        </div>
                    </div>
                </div>
            )}

            {showAbonneSplitModal && selectedAbonne && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h2 className="text-2xl font-black mb-2 text-charcoal-900 dark:text-white">Checkout Abonné</h2>
                        <p className="text-sm text-gray-500 mb-6">For: <strong className="text-terracotta-600">{selectedAbonne.name}</strong></p>
                        
                        <div className="bg-gray-50 dark:bg-charcoal-700 p-4 rounded-xl mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600 dark:text-gray-300">Total Purchase</span>
                                <span className="font-bold text-charcoal-900 dark:text-white">RWF {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Is the client paying any cash right now? (Optional)</label>
                            <input
                                type="number"
                                placeholder="Upfront Cash (e.g. 0)"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 text-xl font-bold dark:text-white"
                                value={abonneUpfrontCash}
                                onChange={e => setAbonneUpfrontCash(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Enter 0 to add the full RWF {calculateTotal().toLocaleString()} to their debt tab.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAbonneSplitModal(false)}
                                className="flex-1 py-3 bg-gray-200 dark:bg-charcoal-700 text-charcoal-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAbonneCheckout}
                                disabled={processing}
                                className="flex-1 py-3 bg-terracotta-500 text-white rounded-xl font-bold hover:bg-terracotta-600 transition-all"
                            >
                                {processing ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
    `;

    if (!content.includes('showAbonneSelectModal')) {
        content = content.replace(
            /{showStartShiftModal && \(/,
            `${abonneModals}\n            {showStartShiftModal && (`
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

applyToPos(path.join(__dirname, 'abelus-frontend/src/pages/admin/POS.jsx'));
applyToPos(path.join(__dirname, 'abelus-frontend/src/pages/SellerPOS.jsx'));

console.log("Patched POS files with Abonné features");
