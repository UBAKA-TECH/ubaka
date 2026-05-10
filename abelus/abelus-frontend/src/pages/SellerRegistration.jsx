import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaStore, FaIdCard, FaBuilding, FaFileUpload, FaPhone,
    FaCheckCircle, FaArrowLeft, FaArrowRight,
    FaFileAlt, FaSignature, FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';

export default function SellerRegistration() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
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
                console.error('Failed to fetch terms');
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

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
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
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-[0.98]"
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800">
                    <div className="bg-amber-500 p-10 text-center text-white relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl"></div>

                        <FaStore className="text-6xl mx-auto mb-6 relative z-10" />
                        <h1 className="text-4xl font-black mb-2 relative z-10">Become a Seller</h1>
                        <p className="text-amber-50 font-medium relative z-10">Join Impressa marketplace and start selling your products</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-10 py-8 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex flex-col items-center gap-2 group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm ${step >= 1 ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800'}`}>
                                {step > 1 ? <FaCheckCircle className="text-lg" /> : '1'}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= 1 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>Store Info</span>
                        </div>
                        <div className={`flex-1 h-[2px] rounded-full transition-all ${step > 1 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-800'}`}></div>
                        <div className="flex flex-col items-center gap-2 group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm ${step >= 2 ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800'}`}>
                                {step > 2 ? <FaCheckCircle className="text-lg" /> : '2'}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>Documents</span>
                        </div>
                        <div className={`flex-1 h-[2px] rounded-full transition-all ${step > 2 ? 'bg-amber-500' : 'bg-gray-200 dark:bg-slate-800'}`}></div>
                        <div className="flex flex-col items-center gap-2 group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm ${step >= 3 ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800'}`}>
                                3
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step >= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>Terms</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-10 mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold animate-shake">
                            <FaExclamationTriangle /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-10">
                        {/* Step 1: Store Information */}
                        {step === 1 && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                        <FaStore className="text-amber-600 dark:text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Store Information</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Store Name *</label>
                                        <input
                                            type="text"
                                            name="storeName"
                                            required
                                            value={formData.storeName}
                                            onChange={handleChange}
                                            placeholder="Enter your store name"
                                            className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Store Phone *</label>
                                        <div className="relative group">
                                            <FaPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                type="tel"
                                                name="storePhone"
                                                required
                                                value={formData.storePhone}
                                                onChange={handleChange}
                                                placeholder="+250 7XX XXX XXX"
                                                className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Store Description</label>
                                        <textarea
                                            name="storeDescription"
                                            value={formData.storeDescription}
                                            onChange={handleChange}
                                            placeholder="Describe what you sell, your vision, and what makes your store special..."
                                            rows={4}
                                            className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: RDB Documents */}
                        {step === 2 && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                        <FaIdCard className="text-amber-600 dark:text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">RDB Business Documents</h3>
                                </div>

                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 mb-8">
                                    <p className="text-sm font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
                                        To sell on Impressa, you need a valid TIN number and RDB certificate issued by the Rwanda Development Board.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">TIN Number *</label>
                                        <div className="relative group">
                                            <FaIdCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="tinNumber"
                                                required
                                                value={formData.tinNumber}
                                                onChange={handleChange}
                                                placeholder="9-digit TIN"
                                                maxLength={9}
                                                className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-black tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Business Type *</label>
                                        <select
                                            name="businessType"
                                            value={formData.businessType}
                                            onChange={handleChange}
                                            className="block w-full px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold appearance-none cursor-pointer"
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
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Registered Business Name *</label>
                                    <div className="relative group">
                                        <FaBuilding className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="businessName"
                                            required
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="As registered with RDB"
                                            className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">RDB Certificate *</label>
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
                                            <label htmlFor="rdbCertificate" className="flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all">
                                                <FaFileUpload className="text-amber-600 dark:text-amber-500 text-xl flex-shrink-0" />
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 truncate">
                                                    {fileNames.rdbCertificate || 'Upload Certificate'}
                                                </span>
                                            </label>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 ml-1">PDF, JPG, or PNG (max 5MB)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">National ID (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="nationalId"
                                                name="nationalId"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="nationalId" className="flex items-center gap-3 px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all">
                                                <FaFileUpload className="text-amber-600 dark:text-amber-500 text-xl flex-shrink-0" />
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 truncate">
                                                    {fileNames.nationalId || 'Upload ID'}
                                                </span>
                                            </label>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 ml-1">Front side of your ID</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Terms & Signature */}
                        {step === 3 && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                        <FaFileAlt className="text-amber-600 dark:text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Terms & Conditions</h3>
                                </div>

                                <div
                                    className="bg-gray-50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 max-h-[400px] overflow-y-auto prose dark:prose-invert prose-sm max-w-none scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent"
                                    ref={termsRef}
                                    onScroll={handleTermsScroll}
                                >
                                    <div
                                        className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: termsContent.replace(/\n/g, '<br/>').replace(/#{1,3}\s/g, '')
                                        }}
                                    />
                                </div>

                                {!termsScrolled && (
                                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest animate-bounce">
                                        <span>⬇️ Please scroll to the bottom</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-4 bg-gray-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-gray-100 dark:border-slate-800/50">
                                    <input
                                        type="checkbox"
                                        id="termsAccepted"
                                        name="termsAccepted"
                                        className="w-6 h-6 text-amber-600 focus:ring-amber-500 border-gray-300 rounded-lg cursor-pointer transition-all mt-1"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        disabled={!termsScrolled}
                                    />
                                    <label htmlFor="termsAccepted" className="text-sm font-bold text-gray-800 dark:text-gray-300 cursor-pointer leading-tight">
                                        I have read and agree to the Terms & Conditions and understand that Impressa will verify my RDB documents.
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                                        <FaSignature className="text-amber-600" />
                                        Digital Signature *
                                    </label>
                                    <input
                                        name="digitalSignature"
                                        type="text"
                                        required
                                        className="block w-full px-6 py-5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-amber-900 dark:text-amber-400 italic font-serif text-2xl placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all shadow-inner text-center md:text-left"
                                        placeholder="Type your full legal name"
                                        value={formData.digitalSignature}
                                        onChange={handleChange}
                                    />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">By typing your name, you are digitally signing this agreement</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-10 mt-10 border-t border-gray-100 dark:border-slate-800">
                            {step > 1 && (
                                <button
                                    type="button"
                                    className="flex-1 py-4 px-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-700 dark:text-gray-300 font-black hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                                    onClick={prevStep}
                                >
                                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    className="flex-[2] py-4 px-6 bg-amber-500 text-white rounded-2xl font-black text-lg hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-2 group ml-auto"
                                    onClick={nextStep}
                                >
                                    Next Step <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-3 group ml-auto"
                                >
                                    {loading ? (
                                        <><FaSpinner className="animate-spin text-2xl" /> Submitting Application...</>
                                    ) : (
                                        <><FaCheckCircle /> Submit Application</>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
