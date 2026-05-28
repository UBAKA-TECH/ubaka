import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { FaTrash, FaPlus, FaSave } from "react-icons/fa";

const JournalEntryForm = ({ onSuccess }) => {
    const [accounts, setAccounts] = useState([]);
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [entries, setEntries] = useState([
        { account: "", debit: 0, credit: 0 },
        { account: "", debit: 0, credit: 0 },
    ]);

    useEffect(() => {
        axios.get("/finance/accounts").then((res) => setAccounts(res.data));
    }, []);

    const handleEntryChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index][field] = value;
        setEntries(newEntries);
    };

    const addRow = () => {
        setEntries([...entries, { account: "", debit: 0, credit: 0 }]);
    };

    const removeRow = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/finance/transactions", {
                date,
                description,
                type: "Journal",
                entries: entries.map(e => ({
                    account: e.account,
                    debit: parseFloat(e.debit) || 0,
                    credit: parseFloat(e.credit) || 0
                }))
            });
            alert("Transaction recorded successfully!");
            setDescription("");
            setEntries([
                { account: "", debit: 0, credit: 0 },
                { account: "", debit: 0, credit: 0 },
            ]);
            if (onSuccess) onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to record transaction");
        }
    };

    const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700">
            <h2 className="text-lg font-bold text-charcoal-800 dark:text-white mb-6">New Journal Entry</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Description</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Office Supplies"
                            required
                        />
                    </div>
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider border-b border-cream-200 dark:border-charcoal-700">
                                <th className="pb-3 pl-1">Account</th>
                                <th className="pb-3 w-40">Debit</th>
                                <th className="pb-3 w-40">Credit</th>
                                <th className="pb-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100 dark:divide-charcoal-700">
                            {entries.map((entry, index) => (
                                <tr key={index}>
                                    <td className="py-2 pr-2">
                                        <select
                                            className="w-full px-3 py-2 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-lg text-charcoal-800 dark:text-white outline-none transition-colors"
                                            value={entry.account}
                                            onChange={(e) => handleEntryChange(index, "account", e.target.value)}
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.code} - {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-2 pr-2">
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-lg text-charcoal-800 dark:text-white outline-none text-right transition-colors"
                                            value={entry.debit}
                                            onChange={(e) => handleEntryChange(index, "debit", e.target.value)}
                                            min="0"
                                            step="0.01"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </td>
                                    <td className="py-2 pr-2">
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-lg text-charcoal-800 dark:text-white outline-none text-right transition-colors"
                                            value={entry.credit}
                                            onChange={(e) => handleEntryChange(index, "credit", e.target.value)}
                                            min="0"
                                            step="0.01"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </td>
                                    <td className="py-2 text-center">
                                        {entries.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRow(index)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Remove line"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold text-charcoal-800 dark:text-white border-t border-cream-200 dark:border-charcoal-700">
                                <td className="py-3 text-right pr-4">Total:</td>
                                <td className={`py-3 text-right pr-2 ${isBalanced ? "text-sage-600 dark:text-sage-400" : "text-red-600 dark:text-red-400"}`}>
                                    {totalDebit.toFixed(2)}
                                </td>
                                <td className={`py-3 text-right pr-2 ${isBalanced ? "text-sage-600 dark:text-sage-400" : "text-red-600 dark:text-red-400"}`}>
                                    {totalCredit.toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={addRow}
                        className="px-4 py-2 text-charcoal-600 dark:text-charcoal-400 hover:bg-cream-100 dark:hover:bg-charcoal-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <FaPlus size={14} /> Add Line
                    </button>

                    <div className="flex items-center gap-4">
                        {!isBalanced && (
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                Debits must equal Credits
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={!isBalanced || totalDebit === 0}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all shadow-lg ${isBalanced && totalDebit > 0
                                    ? "bg-terracotta-500 hover:bg-terracotta-600 shadow-terracotta-500/20"
                                    : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                                }`}
                        >
                            <FaSave /> Record Transaction
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JournalEntryForm;
