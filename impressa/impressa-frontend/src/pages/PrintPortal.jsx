import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaCloudUploadAlt, FaPrint, FaFileAlt, FaCheckCircle, FaCalculator, FaInfoCircle, FaTimes, FaStore } from "react-icons/fa";
import * as pdfjsLib from 'pdfjs-dist';

import api from "../utils/axiosInstance";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { useTranslation } from "react-i18next";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PrintPortal = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const sellerId = searchParams.get("seller");
    
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shopName, setShopName] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [files, setFiles] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [notes, setNotes] = useState("");
    const [colorMode, setColorMode] = useState("Black & White");
    const [needsEditing, setNeedsEditing] = useState(false);
    const [contactPhone, setContactPhone] = useState("");
    const [contactName, setContactName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const url = sellerId ? `/products?type=service&sellerId=${sellerId}` : `/products?type=service`;
                const res = await api.get(url);
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                const filteredServices = data.filter(p => p.type === 'service');
                
                // If filtering by seller, try to extract the shop name from the first product
                if (sellerId && filteredServices.length > 0 && filteredServices[0].seller) {
                    setShopName(filteredServices[0].seller.storeName || filteredServices[0].seller.name);
                }
                
                setServices(filteredServices);
            } catch (err) {
                console.error("Failed to fetch services:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [sellerId]);

    const handleFileChange = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setFiles(prev => [...prev, ...selectedFiles]);
        setIsScanning(true);

        let newPagesCount = 0;
        
        for (const f of selectedFiles) {
            if (f.type === "application/pdf") {
                try {
                    const arrayBuffer = await f.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    newPagesCount += pdf.numPages;
                } catch (err) {
                    console.error("Error reading PDF pages:", err);
                    newPagesCount += 1;
                }
            } else {
                newPagesCount += 1;
            }
        }

        setQuantity(prev => prev + newPagesCount);
        setIsScanning(false);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedService || files.length === 0) return alert("Please select a service and upload at least one file.");
        if (!contactName || !contactPhone) return alert("Please provide your name and phone number so the shop can contact you.");

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("serviceId", selectedService.id || selectedService.id);
            
            files.forEach(f => {
                fd.append("files", f);
            });
            
            fd.append("quantity", quantity === 0 ? 1 : quantity);
            
            const finalNotes = `Contact Name: ${contactName || 'Not Provided'}\nContact Phone: ${contactPhone || 'Not Provided'}\n\nPrinting Mode: ${colorMode}\nNeeds Editing/Design: ${needsEditing ? 'Yes' : 'No'}\n\nAdditional Notes: ${notes}`;
            fd.append("notes", finalNotes);

            await api.post("/orders/inquiry", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            setSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send inquiry");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <Header />
                <div className="max-w-2xl mx-auto py-20 px-6 text-center">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <FaCheckCircle className="text-5xl text-green-600" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{t('common.success')}!</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 font-medium">
                        The seller has received your files and details. They will review it and send you a quote shortly. You can track this in your dashboard.
                    </p>
                    <button 
                        onClick={() => window.location.href = "/"}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        {t('common.back')}
                    </button>
                </div>
                <LandingFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />
            
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 py-20 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-center md:text-left">
                            {shopName && (
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-white mb-4 border border-white/20">
                                    <FaStore className="text-yellow-300" /> Welcome to {shopName}
                                </div>
                            )}
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">{t('print_portal.title')}</span>
                            </h1>
                            <p className="text-indigo-100 text-lg font-medium opacity-80 max-w-lg">
                                {t('print_portal.subtitle')}
                            </p>
                        </div>
                        <div className="hidden md:block w-48 h-48 bg-white/5 backdrop-blur-sm rounded-[2.5rem] border border-white/10 p-6 transform rotate-3">
                            <FaPrint className="text-8xl text-white/20 absolute bottom-4 right-4" />
                            <FaFileAlt className="text-6xl text-white/40" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12 -mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-colors">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <FaCalculator className="text-indigo-600 text-lg" /> {t('print_portal.form.service_details')}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{t('print_portal.form.select_service')}</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {loading ? (
                                                <div className="animate-pulse flex space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                                                    <div className="flex-1 space-y-2 py-1">
                                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                                                    </div>
                                                </div>
                                            ) : services.map(s => (
                                                <button
                                                    key={s.id || s.id}
                                                    type="button"
                                                    onClick={() => setSelectedService(s)}
                                                    className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                                        selectedService?.id === s.id || selectedService?.id === s.id
                                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                                                        : 'border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-800'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className={`font-bold ${selectedService?.id === s.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>{s.name}</p>
                                                        <p className="text-xs text-gray-500">Starting from RWF {s.price.toLocaleString()}</p>
                                                        {s.seller && (
                                                            <p className="text-xs text-indigo-500 mt-1 font-bold flex items-center gap-1">
                                                                <FaStore /> {s.seller.storeName || s.seller.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedService?.id === s.id || selectedService?.id === s.id ? <FaCheckCircle className="text-indigo-600" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{t('print_portal.form.upload_files')}</label>
                                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-[2rem] cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group overflow-hidden">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">
                                                        {isScanning ? "Scanning PDFs..." : t('print_portal.form.drop_files')}
                                                    </p>
                                                </div>
                                                <input type="file" className="hidden" multiple onChange={handleFileChange} />
                                            </label>

                                            {files.length > 0 && (
                                                <div className="space-y-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                                    {files.map((f, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FaFileAlt className="text-indigo-500 shrink-0" />
                                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate w-32">{f.name}</span>
                                                            </div>
                                                            <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{t('print_portal.form.pages_qty')}</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-bold text-base"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Color Mode and Editing Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('print_portal.form.color_mode')}</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="colorMode" 
                                                    value="Black & White" 
                                                    checked={colorMode === "Black & White"}
                                                    onChange={(e) => setColorMode(e.target.value)}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{t('print_portal.form.bw')}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="colorMode" 
                                                    value="Color" 
                                                    checked={colorMode === "Color"}
                                                    onChange={(e) => setColorMode(e.target.value)}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{t('print_portal.form.color')}</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('print_portal.form.editing_service')}</label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={needsEditing}
                                                onChange={(e) => setNeedsEditing(e.target.checked)}
                                                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <div>
                                                <span className="text-gray-700 dark:text-gray-300 font-bold text-sm block">{t('print_portal.form.needs_editing')}</span>
                                                <span className="text-gray-500 text-xs block">{t('print_portal.form.editing_helper')}</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{t('print_portal.form.name_label')}</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder={t('print_portal.form.name_placeholder')}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{t('print_portal.form.phone_label')}</label>
                                        <input 
                                            type="tel" 
                                            required
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder={t('print_portal.form.phone_placeholder')}
                                            className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">{t('print_portal.form.instructions_label')}</label>
                                    <textarea 
                                        rows="4"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={t('print_portal.form.instructions_placeholder')}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-100 dark:border-gray-600 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || isScanning || !selectedService || files.length === 0}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt /> {t('print_portal.form.submit')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info Side */}
                    <div className="space-y-8">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30">
                            <h3 className="text-2xl font-black mb-6">{t('print_portal.how_it_works.title')}</h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black shrink-0">1</div>
                                    <p className="font-medium opacity-90">{t('print_portal.how_it_works.step1')}</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black shrink-0">2</div>
                                    <p className="font-medium opacity-90">{t('print_portal.how_it_works.step2')}</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black shrink-0">3</div>
                                    <p className="font-medium opacity-90">{t('print_portal.how_it_works.step3')}</p>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaInfoCircle className="text-yellow-500" /> {t('print_portal.guidelines.title')}
                            </h3>
                            <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                <p>• {t('print_portal.guidelines.formats')}</p>
                                <p>• {t('print_portal.guidelines.max_size')}</p>
                                <p>• {t('print_portal.guidelines.large_files')}</p>
                                <p>• {t('print_portal.guidelines.response_time')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
};

export default PrintPortal;
