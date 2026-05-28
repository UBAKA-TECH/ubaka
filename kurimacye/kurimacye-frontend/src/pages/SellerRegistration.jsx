import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaStore, FaIdCard, FaBuilding, FaFileUpload, FaPhone,
    FaCheckCircle, FaArrowLeft, FaArrowRight,
    FaFileAlt, FaSignature, FaSpinner, FaExclamationTriangle,
    FaLock
} from 'react-icons/fa';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';

export default function SellerRegistration() {
    const navigate = useNavigate();
    const [activeAccordion, setActiveAccordion] = useState(1); // 1, 2, or 3
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [termsContent, setTermsContent] = useState('');
    const [termsScrolled, setTermsScrolled] = useState(false);
    const termsRef = useRef(null);

    const [formData, setFormData] = useState({
        storeName: '',
        storeDescription: '',
        storePhone: '',
        tinNumber: '',
        businessName: '',
        businessType: 'sole_proprietor',
        rdbCertificate: null,
        nationalId: null,
        termsAccepted: false,
        digitalSignature: ''
    });

    const [fileNames, setFileNames] = useState({
        rdbCertificate: '',
        nationalId: ''
    });

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const res = await fetch(`${API_URL}/seller-verification/terms`);
                const data = await res.json();
                if (data.success) {
                    setTermsContent(data.data.content);
                }
            } catch (err) {
            }
        };
        fetchTerms();
    }, [API_URL]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            setFileNames(prev => ({ ...prev, [name]: files[0].name }));
        }
    };

    const handleTermsScroll = () => {
        if (termsRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                setTermsScrolled(true);
            }
        }
    };

    const isStepValid = (stepNum) => {
        switch (stepNum) {
            case 1:
                return formData.storeName.trim() !== '' && formData.storePhone.trim() !== '';
            case 2:
                const tinClean = formData.tinNumber.replace(/\s/g, '');
                const tinRegex = /^\d{9}$/;
                return tinRegex.test(tinClean) && formData.businessName.trim() !== '' && formData.rdbCertificate !== null;
            case 3:
                return formData.termsAccepted && formData.digitalSignature.trim() !== '' && termsScrolled;
            default:
                return false;
        }
    };

    const isLocked = (stepNum) => {
        if (stepNum === 1) return false;
        if (stepNum === 2) return !isStepValid(1);
        if (stepNum === 3) return !isStepValid(1) || !isStepValid(2);
        return false;
    };

    const handleAccordionToggle = (stepNum) => {
        if (isLocked(stepNum)) return;
        setActiveAccordion(activeAccordion === stepNum ? null : stepNum);
    };

    const validateStep = (stepNum) => {
        setError('');
        switch (stepNum) {
            case 1:
                if (!formData.storeName.trim()) {
                    setError('Store name is required');
                    return false;
                }
                if (!formData.storePhone.trim()) {
                    setError('Phone number is required');
                    return false;
                }
                return true;
            case 2:
                if (!formData.tinNumber.trim()) {
                    setError('TIN number is required');
                    return false;
                }
                const tinRegex = /^\d{9}$/;
                if (!tinRegex.test(formData.tinNumber.replace(/\s/g, ''))) {
                    setError('TIN must be exactly 9 digits');
                    return false;
                }
                if (!formData.businessName.trim()) {
                    setError('Registered business name is required');
                    return false;
                }
                if (!formData.rdbCertificate) {
                    setError('RDB certificate is required');
                    return false;
                }
                return true;
            case 3:
                if (!termsScrolled) {
                    setError('Please read the entire terms & conditions');
                    return false;
                }
                if (!formData.termsAccepted) {
                    setError('You must accept the terms & conditions');
                    return false;
                }
                if (!formData.digitalSignature.trim()) {
                    setError('Digital signature (your full legal name) is required');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const handleNext = (curr) => {
        if (validateStep(curr)) {
            setActiveAccordion(curr + 1);
        }
    };

    const handleBack = (curr) => {
        setActiveAccordion(curr - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login?redirect=/become-seller');
                return;
            }

            const submitData = new FormData();
            submitData.append('storeName', formData.storeName);
            submitData.append('storeDescription', formData.storeDescription);
            submitData.append('storePhone', formData.storePhone);
            submitData.append('tinNumber', formData.tinNumber);
            submitData.append('businessName', formData.businessName);
            submitData.append('businessType', formData.businessType);
            submitData.append('termsAccepted', formData.termsAccepted);
            submitData.append('digitalSignature', formData.digitalSignature);
            submitData.append('rdbCertificate', formData.rdbCertificate);
            if (formData.nationalId) {
                submitData.append('nationalId', formData.nationalId);
            }

            const res = await fetch(`${API_URL}/seller-verification/apply`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: submitData
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Application failed');
            }
        } catch (err) {
            setError('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-cream-100 dark:bg-slate-950 transition-colors duration-300">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <FaCheckCircle className="text-5xl text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg font-medium">Your seller application has been submitted successfully.</p>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl p-6 text-left mb-10">
                            <strong className="block text-emerald-900 dark:text-emerald-400 font-black uppercase tracking-wider text-xs mb-4">What happens next?</strong>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-emerald-800 dark:text-emerald-500/80 font-bold text-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Documents under review (1-3 business days)
                                </li>
                                <li className="flex items-center gap-3 text-emerald-800 dark:text-emerald-500/80 font-bold text-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Email notification when approved
                                </li>
                                <li className="flex items-center gap-3 text-emerald-800 dark:text-emerald-500/80 font-bold text-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    Access to your seller dashboard
                                </li>
                            </ul>
                        </div>

                        <button
                            className="w-full py-4 bg-terracotta-500 text-white rounded-2xl font-black text-lg hover:bg-terracotta-600 transition-all shadow-lg shadow-terracotta-500/10 active:scale-[0.98]"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
                <LandingFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                    <div className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 p-10 text-center text-white relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-terracotta-400/20 rounded-full blur-2xl"></div>

                        <FaStore className="text-6xl mx-auto mb-6 relative z-10 animate-pulse" />
                        <h1 className="text-4xl font-black mb-2 relative z-10">Become a Seller</h1>
                        <p className="text-terracotta-50 font-medium relative z-10">Register your business, upload credentials, and launch your store on Kuri Macye</p>
                    </div>

                    {error && (
                        <div className="mx-10 mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold animate-shake">
                            <FaExclamationTriangle className="flex-shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-10 space-y-6">
                        
                        {/* Accordion 1: Store Information */}
                        <div className="bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
                            <button
                                type="button"
                                onClick={() => handleAccordionToggle(1)}
                                className="w-full flex items-center justify-between px-8 py-6 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${activeAccordion === 1 ? 'bg-terracotta-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                                        01
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white">Store Information</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Your public store branding details</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isStepValid(1) && <FaCheckCircle className="text-emerald-500 text-lg" />}
                                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${activeAccordion === 1 ? 'border-terracotta-500 text-terracotta-500' : 'border-gray-300 dark:border-slate-700 text-gray-450'}`}>
                                        {activeAccordion === 1 ? '−' : '+'}
                                    </div>
                                </div>
                            </button>

                            <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 1 ? 'max-h-[600px] border-t border-gray-100 dark:border-slate-800' : 'max-h-0'}`}>
                                <div className="p-8 space-y-6 animate-fadeIn">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Store Name *</label>
                                        <input
                                            type="text"
                                            name="storeName"
                                            required
                                            value={formData.storeName}
                                            onChange={handleChange}
                                            placeholder="Enter your public store name"
                                            className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Store Contact Phone *</label>
                                        <div className="relative group">
                                            <FaPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terracotta-500 transition-colors" />
                                            <input
                                                type="tel"
                                                name="storePhone"
                                                required
                                                value={formData.storePhone}
                                                onChange={handleChange}
                                                placeholder="+250 7XX XXX XXX"
                                                className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Store Description</label>
                                        <textarea
                                            name="storeDescription"
                                            value={formData.storeDescription}
                                            onChange={handleChange}
                                            placeholder="Describe what you sell, your specialties, or customer services..."
                                            rows={4}
                                            className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleNext(1)}
                                            className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold text-sm shadow-md shadow-terracotta-500/10 transition-all active:scale-[0.97] flex items-center gap-2 group"
                                        >
                                            Continue to Documents <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accordion 2: Business Documents */}
                        <div className={`bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 ${isLocked(2) ? 'opacity-50' : ''}`}>
                            <button
                                type="button"
                                onClick={() => handleAccordionToggle(2)}
                                disabled={isLocked(2)}
                                className="w-full flex items-center justify-between px-8 py-6 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${activeAccordion === 2 ? 'bg-terracotta-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                                        02
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white">Business Verification</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">TIN registration & RDB documents</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isStepValid(2) && <FaCheckCircle className="text-emerald-500 text-lg" />}
                                    {isLocked(2) ? (
                                        <FaLock className="text-gray-400 text-sm mr-1" />
                                    ) : (
                                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${activeAccordion === 2 ? 'border-terracotta-500 text-terracotta-500' : 'border-gray-300 dark:border-slate-700 text-gray-450'}`}>
                                            {activeAccordion === 2 ? '−' : '+'}
                                        </div>
                                    )}
                                </div>
                            </button>

                            <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 2 && !isLocked(2) ? 'max-h-[800px] border-t border-gray-100 dark:border-slate-800' : 'max-h-0'}`}>
                                <div className="p-8 space-y-6 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">TIN Number *</label>
                                            <div className="relative group">
                                                <FaIdCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terracotta-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="tinNumber"
                                                    required
                                                    value={formData.tinNumber}
                                                    onChange={handleChange}
                                                    placeholder="9-digit TIN"
                                                    maxLength={9}
                                                    className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-black tracking-widest"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Business Type *</label>
                                            <select
                                                name="businessType"
                                                value={formData.businessType}
                                                onChange={handleChange}
                                                className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="sole_proprietor">Sole Proprietor</option>
                                                <option value="company">Company (LTD)</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="cooperative">Cooperative</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Registered Business Name *</label>
                                        <div className="relative group">
                                            <FaBuilding className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-terracotta-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="businessName"
                                                required
                                                value={formData.businessName}
                                                onChange={handleChange}
                                                placeholder="As registered on your TIN/RDB certificate"
                                                className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">RDB Registration Certificate *</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="rdbCertificate"
                                                    name="rdbCertificate"
                                                    required
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <label htmlFor="rdbCertificate" className="flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-slate-800/40 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-terracotta-500 hover:bg-terracotta-50/10 transition-all">
                                                    <FaFileUpload className="text-terracotta-500 text-xl flex-shrink-0" />
                                                    <span className="text-sm font-bold text-gray-650 dark:text-gray-400 truncate">
                                                        {fileNames.rdbCertificate || 'Upload Certificate PDF/Image'}
                                                    </span>
                                                </label>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1.5 ml-1">PDF, JPG, or PNG (max 5MB)</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">National ID / Passport (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="nationalId"
                                                    name="nationalId"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <label htmlFor="nationalId" className="flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-slate-800/40 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-terracotta-500 hover:bg-terracotta-50/10 transition-all">
                                                    <FaFileUpload className="text-terracotta-500 text-xl flex-shrink-0" />
                                                    <span className="text-sm font-bold text-gray-650 dark:text-gray-400 truncate">
                                                        {fileNames.nationalId || 'Upload ID Document'}
                                                    </span>
                                                </label>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1.5 ml-1">Front/biodata page (PDF or Image)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-gray-50 dark:border-slate-800/60">
                                        <button
                                            type="button"
                                            onClick={() => handleBack(2)}
                                            className="px-5 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 group"
                                        >
                                            <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleNext(2)}
                                            className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold text-sm shadow-md shadow-terracotta-500/10 transition-all active:scale-[0.97] flex items-center gap-2 group"
                                        >
                                            Continue to Terms <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accordion 3: Terms & Signature */}
                        <div className={`bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 ${isLocked(3) ? 'opacity-50' : ''}`}>
                            <button
                                type="button"
                                onClick={() => handleAccordionToggle(3)}
                                disabled={isLocked(3)}
                                className="w-full flex items-center justify-between px-8 py-6 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${activeAccordion === 3 ? 'bg-terracotta-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                                        03
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white">Agreement & Signature</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Read seller contract and digitally sign</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isStepValid(3) && <FaCheckCircle className="text-emerald-500 text-lg" />}
                                    {isLocked(3) ? (
                                        <FaLock className="text-gray-400 text-sm mr-1" />
                                    ) : (
                                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${activeAccordion === 3 ? 'border-terracotta-500 text-terracotta-500' : 'border-gray-300 dark:border-slate-700 text-gray-450'}`}>
                                            {activeAccordion === 3 ? '−' : '+'}
                                        </div>
                                    )}
                                </div>
                            </button>

                            <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 3 && !isLocked(3) ? 'max-h-[1000px] border-t border-gray-100 dark:border-slate-800' : 'max-h-0'}`}>
                                <div className="p-8 space-y-6 animate-fadeIn">
                                    <div className="flex items-center gap-3 bg-terracotta-50/50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl p-4">
                                        <FaFileAlt className="text-terracotta-500 text-xl shrink-0" />
                                        <p className="text-xs font-bold text-terracotta-800 dark:text-terracotta-300 leading-normal">
                                            Please read the complete merchant terms below. You must scroll to the bottom of the document to enable acceptance.
                                        </p>
                                    </div>

                                    <div
                                        className="bg-gray-50 dark:bg-slate-950/60 border border-gray-100 dark:border-slate-855 rounded-2xl p-6 max-h-[300px] overflow-y-auto prose dark:prose-invert prose-sm max-w-none scrollbar-thin scrollbar-thumb-terracotta-500/20 scrollbar-track-transparent"
                                        ref={termsRef}
                                        onScroll={handleTermsScroll}
                                    >
                                        <div
                                            className="text-gray-600 dark:text-gray-450 text-xs font-medium leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: termsContent.replace(/\n/g, '<br/>').replace(/#{1,3}\s/g, '')
                                            }}
                                        />
                                    </div>

                                    {!termsScrolled && (
                                        <div className="flex items-center justify-center gap-2 text-terracotta-500 font-black text-[10px] uppercase tracking-widest animate-bounce">
                                            <span>⬇️ Please scroll down to review terms</span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 bg-gray-50/50 dark:bg-slate-800/20 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <input
                                            type="checkbox"
                                            id="termsAccepted"
                                            name="termsAccepted"
                                            className="w-5.5 h-5.5 text-terracotta-500 focus:ring-terracotta-500 border-gray-300 dark:border-slate-700 rounded-md cursor-pointer transition-all mt-0.5"
                                            checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            disabled={!termsScrolled}
                                        />
                                        <label htmlFor="termsAccepted" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer leading-tight">
                                            I have read and agree to the Terms & Conditions and understand that Kuri Macye will verify my RDB documents.
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-black text-gray-700 dark:text-gray-300 ml-1">
                                            <FaSignature className="text-terracotta-500" />
                                            Digital Signature (Full Legal Name) *
                                        </label>
                                        <input
                                            name="digitalSignature"
                                            type="text"
                                            required
                                            className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-terracotta-900 dark:text-terracotta-400 italic font-serif text-xl placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all shadow-inner text-center md:text-left"
                                            placeholder="Type your full legal name"
                                            value={formData.digitalSignature}
                                            onChange={handleChange}
                                        />
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center">By typing your name, you are digitally signing this agreement</p>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t border-gray-50 dark:border-slate-800/60">
                                        <button
                                            type="button"
                                            onClick={() => handleBack(3)}
                                            className="px-5 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 group"
                                        >
                                            <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-black text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-3 group"
                                        >
                                            {loading ? (
                                                <><FaSpinner className="animate-spin text-lg" /> Submitting...</>
                                            ) : (
                                                <><FaCheckCircle /> Submit Application</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
