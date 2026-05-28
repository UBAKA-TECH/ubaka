import { useState, useEffect } from 'react';
import { 
    FaBriefcase, FaMapMarkerAlt, FaClock, FaCheckCircle, 
    FaSpinner, FaArrowRight, FaArrowLeft, FaGlobe, 
    FaPrint, FaLeaf, FaLaptopCode, FaPaperPlane,
    FaExclamationTriangle
} from 'react-icons/fa';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { getActiveJobListings, submitJobApplication } from '../services/api';
import { useTranslation } from 'react-i18next';

const iconMap = {
    FaLaptopCode,
    FaPrint,
    FaGlobe,
    FaLeaf,
    FaBriefcase
};

export default function Careers() {
    const { t, i18n } = useTranslation();
    const [openRoles, setOpenRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeJobId, setActiveJobId] = useState(null);
    const [applyingJobId, setApplyingJobId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        portfolioLink: '',
        coverLetter: ''
    });

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const res = await getActiveJobListings();
                if (res.success) {
                    setOpenRoles(res.data);
                } else {
                    setErrorMsg(t('careersPage.err_failed'));
                }
            } catch (err) {
                console.error("Error fetching jobs:", err);
                setErrorMsg(t('careersPage.err_failed'));
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyClick = (jobId) => {
        setApplyingJobId(jobId);
        setSuccessMsg('');
        setErrorMsg('');
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            portfolioLink: '',
            coverLetter: ''
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (!formData.fullName || !formData.email || !formData.phone) {
            setErrorMsg(t('careersPage.err_required'));
            setSubmitting(false);
            return;
        }

        try {
            const res = await submitJobApplication(applyingJobId, formData);
            if (res.success) {
                setSuccessMsg(t('careersPage.applied_msg'));
                // Reset form
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    portfolioLink: '',
                    coverLetter: ''
                });
                // Clear applying state after a few seconds
                setTimeout(() => {
                    setApplyingJobId(null);
                }, 6000);
            } else {
                setErrorMsg(res.message || t('careersPage.err_failed'));
            }
        } catch (err) {
            console.error("Error submitting application:", err);
            setErrorMsg(err.response?.data?.message || t('careersPage.err_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    const toggleRoleAccordion = (jobId) => {
        if (applyingJobId) return; // Disable accordion toggle during application
        setActiveJobId(activeJobId === jobId ? null : jobId);
    };

    const getLocalizedRole = (role, lang) => {
        if (lang === 'rw') {
            return {
                title: role.titleRw || role.title,
                department: role.departmentRw || role.department,
                location: role.locationRw || role.location,
                description: role.descriptionRw || role.description,
                requirements: role.requirementsRw && role.requirementsRw.length > 0 ? role.requirementsRw : role.requirements,
                benefits: role.benefitsRw && role.benefitsRw.length > 0 ? role.benefitsRw : role.benefits
            };
        }
        return {
            title: role.title,
            department: role.department,
            location: role.location,
            description: role.description,
            requirements: role.requirements,
            benefits: role.benefits
        };
    };

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-terracotta-400/20 rounded-full blur-2xl"></div>

                <div className="max-w-4xl mx-auto text-center px-6 relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase">
                        {t('careersPage.badge')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        {t('careersPage.hero_title')}
                    </h1>
                    <p className="text-terracotta-100 text-lg max-w-2xl mx-auto font-medium">
                        {t('careersPage.hero_desc')}
                    </p>
                </div>
            </div>

            {/* Core Culture Section */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('careersPage.culture_title')}</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">{t('careersPage.culture_desc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
                        <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl flex items-center justify-center text-terracotta-500 text-xl">
                            <FaGlobe />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">{t('careersPage.val_emp_title')}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-medium">
                            {t('careersPage.val_emp_desc')}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
                        <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl flex items-center justify-center text-terracotta-500 text-xl">
                            <FaPrint />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">{t('careersPage.val_qty_title')}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-medium">
                            {t('careersPage.val_qty_desc')}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
                        <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl flex items-center justify-center text-terracotta-500 text-xl">
                            <FaLeaf />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">{t('careersPage.val_grn_title')}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-medium">
                            {t('careersPage.val_grn_desc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Open Positions List */}
            <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">{t('careersPage.opp_title')}</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">{t('careersPage.opp_desc')}</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <FaSpinner className="animate-spin text-4xl text-terracotta-500" />
                        <p className="text-sm font-bold text-gray-500">{t('careersPage.loading')}</p>
                    </div>
                ) : openRoles.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        <FaBriefcase className="text-4xl text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-base font-black text-gray-900 dark:text-white">{t('careersPage.no_roles_title')}</h3>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{t('careersPage.no_roles_desc')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {openRoles.map(role => {
                            const isExpanded = activeJobId === role.id;
                            const isApplying = applyingJobId === role.id;
                            const RoleIcon = iconMap[role.icon] || FaBriefcase;
                            const localizedRole = getLocalizedRole(role, i18n.language);

                            return (
                                <div 
                                    key={role.id} 
                                    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-300"
                                >
                                    {/* Accordion Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleRoleAccordion(role.id)}
                                        className="w-full flex items-center justify-between px-8 py-6 text-left focus:outline-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-colors ${isExpanded ? 'bg-terracotta-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>
                                                <RoleIcon />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-gray-900 dark:text-white">{localizedRole.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    <span className="flex items-center gap-1"><FaBriefcase /> {localizedRole.department}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {localizedRole.location}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><FaClock /> {role.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-base font-bold transition-all ${isExpanded ? 'border-terracotta-500 text-terracotta-500' : 'border-gray-300 dark:border-slate-700 text-gray-400'}`}>
                                            {isExpanded ? '−' : '+'}
                                        </div>
                                    </button>

                                    {/* Accordion Content */}
                                    <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[1400px] border-t border-gray-100 dark:border-slate-800' : 'max-h-0'}`}>
                                        <div className="p-8 space-y-6 animate-fadeIn">
                                            
                                            {!isApplying ? (
                                                /* Description & Requirement Details */
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('careersPage.role_desc')}</h4>
                                                        <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">{localizedRole.description}</p>
                                                    </div>

                                                    {localizedRole.requirements && localizedRole.requirements.length > 0 && (
                                                        <div className="space-y-2.5">
                                                            <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('careersPage.requirements')}</h4>
                                                            <ul className="space-y-2">
                                                                {localizedRole.requirements.map((reqText, i) => (
                                                                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-1.5" />
                                                                        {reqText}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {localizedRole.benefits && localizedRole.benefits.length > 0 && (
                                                        <div className="space-y-2.5">
                                                            <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('careersPage.benefits')}</h4>
                                                            <ul className="space-y-2">
                                                                {localizedRole.benefits.map((benText, i) => (
                                                                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                                                        {benText}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApplyClick(role.id)}
                                                            className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold text-sm shadow-md shadow-terracotta-500/10 transition-all flex items-center gap-2 group cursor-pointer"
                                                        >
                                                            {t('careersPage.btn_apply')} <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Applications submission form */
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                                                        <div>
                                                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{t('careersPage.apply_title')} {localizedRole.title}</h4>
                                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{t('careersPage.apply_form')}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setApplyingJobId(null)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/60 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-300 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                                                        >
                                                            <FaArrowLeft className="text-[9px]" /> {t('careersPage.btn_back')}
                                                        </button>
                                                    </div>

                                                    {successMsg ? (
                                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-center space-y-3 animate-fadeIn">
                                                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-500">
                                                                <FaCheckCircle className="text-2xl" />
                                                            </div>
                                                            <h5 className="text-sm font-black text-emerald-900 dark:text-emerald-400">{t('careersPage.applied_success')}</h5>
                                                            <p className="text-xs text-emerald-800 dark:text-emerald-500/80 leading-relaxed font-semibold max-w-md mx-auto">{successMsg}</p>
                                                        </div>
                                                    ) : (
                                                        <form onSubmit={handleFormSubmit} className="space-y-5">
                                                            {errorMsg && (
                                                                <div className="p-3 bg-red-50 border border-red-100 text-red-650 rounded-xl text-xs font-bold flex items-center gap-2">
                                                                    <FaExclamationTriangle /> {errorMsg}
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('careersPage.label_name')}</label>
                                                                    <input
                                                                        type="text"
                                                                        name="fullName"
                                                                        required
                                                                        value={formData.fullName}
                                                                        onChange={handleInputChange}
                                                                        placeholder={t('careersPage.placeholder_name')}
                                                                        className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('careersPage.label_email')}</label>
                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        required
                                                                        value={formData.email}
                                                                        onChange={handleInputChange}
                                                                        placeholder={t('careersPage.placeholder_email')}
                                                                        className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('careersPage.label_phone')}</label>
                                                                    <input
                                                                        type="tel"
                                                                        name="phone"
                                                                        required
                                                                        value={formData.phone}
                                                                        onChange={handleInputChange}
                                                                        placeholder={t('careersPage.placeholder_phone')}
                                                                        className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                    />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('careersPage.label_portfolio')}</label>
                                                                    <input
                                                                        type="url"
                                                                        name="portfolioLink"
                                                                        value={formData.portfolioLink}
                                                                        onChange={handleInputChange}
                                                                        placeholder={t('careersPage.placeholder_portfolio')}
                                                                        className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('careersPage.label_cover')}</label>
                                                                <textarea
                                                                    name="coverLetter"
                                                                    value={formData.coverLetter}
                                                                    onChange={handleInputChange}
                                                                    placeholder={t('careersPage.placeholder_cover')}
                                                                    rows={4}
                                                                    className="block w-full px-4.5 py-3.5 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-medium"
                                                                />
                                                            </div>

                                                            <div className="flex justify-end pt-2">
                                                                <button
                                                                    type="submit"
                                                                    disabled={submitting}
                                                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2 group cursor-pointer"
                                                                >
                                                                    {submitting ? (
                                                                        <><FaSpinner className="animate-spin text-xs" /> {t('careersPage.btn_submitting')}</>
                                                                    ) : (
                                                                        <><FaPaperPlane className="text-xs" /> {t('careersPage.btn_submit')}</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <LandingFooter />
        </div>
    );
}
