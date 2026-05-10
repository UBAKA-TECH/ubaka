import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

const LedgerView = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get("/finance/accounts").then((res) => {
            setAccounts(res.data);
            if (res.data.length > 0) {
                setSelectedAccount(res.data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            fetchLedger(selectedAccount);
        }
    }, [selectedAccount]);

    const fetchLedger = async (accountId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/finance/ledger/${accountId}`);
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch ledger");
        } finally {
            setLoading(false);
        }
    };

    const getEntryForAccount = (transaction, accountId) => {
        if (!transaction.entries) return null;
        return transaction.entries.find((e) => {
            const entryAccountId = typeof e.account === 'object' ? e.account.id : e.account;
            return entryAccountId === accountId;
        });
    };

    return (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-charcoal-800 dark:text-white">General Ledger</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        className="w-full sm:w-64 px-4 py-2 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.code} - {acc.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-charcoal-500 dark:text-charcoal-400">Loading transactions...</p>
                </div>
            ) : transactions.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-cream-200 dark:border-charcoal-700 rounded-xl">
                    <p className="text-charcoal-500 dark:text-charcoal-400">No transactions found for this account.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-cream-200 dark:border-charcoal-700">
                    <table className="w-full">
                        <thead className="bg-cream-50 dark:bg-charcoal-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Debit</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100 dark:divide-charcoal-700 bg-white dark:bg-charcoal-800">
                            {transactions.map((tx) => {
                                const entry = getEntryForAccount(tx, selectedAccount);
                                return (
                                    <tr key={tx.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700/50 transition-colors">
                                        <td className="px-6 py-4 text-charcoal-600 dark:text-charcoal-400 whitespace-nowrap">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-charcoal-800 dark:text-white">
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 text-charcoal-500 dark:text-charcoal-500 font-mono text-xs">
                                            {tx.reference || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-charcoal-800 dark:text-white">
                                            {entry?.debit > 0 ? entry.debit.toFixed(2) : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-charcoal-800 dark:text-white">
                                            {entry?.credit > 0 ? entry.credit.toFixed(2) : "-"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LedgerView;
