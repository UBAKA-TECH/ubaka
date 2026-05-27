import { useState } from 'react';
import { 
    FaBriefcase, FaMapMarkerAlt, FaClock, FaCheckCircle, 
    FaSpinner, FaArrowRight, FaArrowLeft, FaGlobe, 
    FaPrint, FaLeaf, FaLaptopCode, FaPaperPlane
} from 'react-icons/fa';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';

export default function Careers() {
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

    const openRoles = [
        {
            id: 'role-1',
            title: 'Fullstack React/Node Engineer',
            department: 'Engineering',
            location: 'Kigali, Rwanda (Hybrid)',
            type: 'Full-Time',
            icon: FaLaptopCode,
            description: 'We are looking for a Senior Fullstack Developer to lead the development of our MIS Admin Dashboard and expand our storefront core APIs. You will work on real-time inventory systems, POS integrations, and automated seller tools.',
            requirements: [
                '3+ years experience with React.js, Node.js, and PostgreSQL/Prisma.',
                'Proven experience building SaaS control planes or e-commerce admin panels.',
                'Familiarity with Cloudinary asset storage and WebSockets integrations.',
                'Passion for creating highly responsive, accessible, and premium user experiences.'
            ],
            benefits: [
                'Competitive compensation package & health insurance.',
                'Flexible hybrid working model (2 days remote).',
                'Modern developer workspace in central Kigali.',
                'Annual learning & development allowance.'
            ]
        },
        {
            id: 'role-2',
            title: 'Graphic & Print Specialist',
            department: 'Production',
            location: 'Kigali HQ',
            type: 'Full-Time',
            icon: FaPrint,
            description: 'Help our users turn their ideas into custom physical products. You will oversee print custom queries, quality audits of submitted vector templates (ID cards, banners, frames), and coordinate with the local print manufacturing team.',
            requirements: [
                'Expert knowledge of Adobe Illustrator, Photoshop, and vector graphics file formats.',
                'Experience with industrial printing machinery and paper/material sourcing.',
                'Meticulous eye for detail and print alignment specifications.',
                'Strong communication skills to assist clients with file tweaks.'
            ],
            benefits: [
                'Hands-on experience with state-of-the-art print equipment.',
                'Health and wellness benefits.',
                'Career progression opportunities into Operations Management.'
            ]
        },
        {
            id: 'role-3',
            title: 'Merchant Onboarding & Growth Lead',
            department: 'Operations',
            location: 'Kigali, Rwanda (Field/Office)',
            type: 'Full-Time',
            icon: FaGlobe,
            description: 'Lead our vendor expansion program. You will be responsible for sourcing local merchants, guiding them through the RDB/TIN onboarding checklist, and reviewing submitted KYC files to activate new storefronts.',
            requirements: [
                'Experience in merchant relations, partnership management, or sales operations.',
                'Deep understanding of Rwandan business registration (RDB) and tax systems (RRA).',
                'Empathetic communicator with strong troubleshooting skills.',
                'Self-starter capable of managing partner pipelines.'
            ],
            benefits: [
                'Attractive commission bonus per active store onboarded.',
                'Travel/fuel allowance.',
                'Company smartphone and computing setup.'
            ]
        },
        {
            id: 'role-4',
            title: 'Sustainability & Solar Program Officer',
            department: 'Impact Projects',
            location: 'Kigali / Remote',
            type: 'Full-Time',
            icon: FaLeaf,
            description: 'Direct our environmental impact products portfolio (solar lanterns, clean cookstoves). You will manage relationships with product suppliers, coordinate clean cooking stove logistics, and compile impact statistics for partner reports.',
            requirements: [
                'Degree in Environmental Sciences, Development Studies, or related fields.',
                '1-2 years experience in project logistics or green energy distribution.',
                'Data compilation skills (Excel/CSV dashboarding).',
                'Commitment to promoting eco-friendly alternatives in Rwanda.'
            ],
            benefits: [
                'Opportunity to work on high-impact climate initiatives.',
                'Flexible working hours.',
                'Comprehensive medical insurance coverage.'
            ]
        }
    ];

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

        // Client-side mock submission delay
        setTimeout(() => {
            if (!formData.fullName || !formData.email || !formData.phone) {
                setErrorMsg('Please fill in all required fields.');
                setSubmitting(false);
                return;
            }

            setSuccessMsg('Your application has been received successfully! Our HR team will reach out to you within 3 business days.');
            setSubmitting(false);
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
        }, 1500);
    };

    const toggleRoleAccordion = (jobId) => {
        if (applyingJobId) return; // Disable accordion toggle during application
        setActiveJobId(activeJobId === jobId ? null : jobId);
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
                        🚀 Join Kuri Macye Ecosystem
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Build the Future of Local Commerce in East Africa
                    </h1>
                    <p className="text-terracotta-100 text-lg max-w-2xl mx-auto font-medium">
                        We are a mission-driven team empowering local designers, print specialists, and merchants. Explore our open roles and grow with us.
                    </p>
                </div>
            </div>

            {/* Core Values Section */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Our Core Culture</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">What guides our everyday decisions and ecosystem mission</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
                        <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl flex items-center justify-center text-terracotta-500 text-xl">
                            <FaGlobe />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">Local Empowerment</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-medium">
                            We bridge the digital divide for local merchants, print shops, and designers by providing them unified storefronts and automated POS systems.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
                        <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl flex items-center justify-center text-terracotta-500 text-xl">
                            <FaPrint />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">Premium Quality</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-medium">
                            Whether delivering variable print packages, clean energy stove products, or custom ID templates, quality consistency defines our ecosystem.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4">
                        <div className="w-12 h-12 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/20 rounded-2xl flex items-center justify-center text-terracotta-500 text-xl">
                            <FaLeaf />
                        </div>
                        <h3 className="text-base font-black text-gray-900 dark:text-white">Green Growth</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed font-medium">
                            We champion sustainable distribution systems, actively prioritizing clean cooking technologies and green energy solar solutions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Open Positions List */}
            <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
                <div className="text-center max-w-xl mx-auto mb-10">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Open Opportunities</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Join us in driving commerce innovation from Kigali</p>
                </div>

                <div className="space-y-6">
                    {openRoles.map(role => {
                        const isExpanded = activeJobId === role.id;
                        const isApplying = applyingJobId === role.id;
                        const RoleIcon = role.icon;

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
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-colors ${isExpanded ? 'bg-terracotta-500 text-white' : 'bg-gray-55 dark:bg-slate-800 text-gray-500'}`}>
                                            <RoleIcon />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-gray-900 dark:text-white">{role.title}</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><FaBriefcase /> {role.department}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><FaMapMarkerAlt /> {role.location}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><FaClock /> {role.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-base font-bold transition-all ${isExpanded ? 'border-terracotta-500 text-terracotta-500' : 'border-gray-300 dark:border-slate-700 text-gray-550'}`}>
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
                                                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest">Role Description</h4>
                                                    <p className="text-xs text-gray-650 dark:text-gray-450 leading-relaxed font-medium">{role.description}</p>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-555 uppercase tracking-widest">Job Requirements</h4>
                                                    <ul className="space-y-2">
                                                        {role.requirements.map((reqText, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-650 dark:text-gray-450 font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-1.5" />
                                                                {reqText}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-555 uppercase tracking-widest">Compensations & Benefits</h4>
                                                    <ul className="space-y-2">
                                                        {role.benefits.map((benText, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-650 dark:text-gray-455 font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                                                {benText}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="flex justify-end pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApplyClick(role.id)}
                                                        className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-bold text-sm shadow-md shadow-terracotta-500/10 transition-all flex items-center gap-2 group cursor-pointer"
                                                    >
                                                        Apply for this Role <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Applications submission form */
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-900 dark:text-white">Apply for {role.title}</h4>
                                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Application Form</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setApplyingJobId(null)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700/60 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-300 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                                                    >
                                                        <FaArrowLeft className="text-[9px]" /> Back to Details
                                                    </button>
                                                </div>

                                                {successMsg ? (
                                                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-center space-y-3 animate-fadeIn">
                                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-500">
                                                            <FaCheckCircle className="text-2xl" />
                                                        </div>
                                                        <h5 className="text-sm font-black text-emerald-900 dark:text-emerald-400">Application Submitted!</h5>
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
                                                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Full Name *</label>
                                                                <input
                                                                    type="text"
                                                                    name="fullName"
                                                                    required
                                                                    value={formData.fullName}
                                                                    onChange={handleInputChange}
                                                                    placeholder="e.g. Marie Keza"
                                                                    className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email Address *</label>
                                                                <input
                                                                    type="email"
                                                                    name="email"
                                                                    required
                                                                    value={formData.email}
                                                                    onChange={handleInputChange}
                                                                    placeholder="keza@domain.rw"
                                                                    className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Phone Number *</label>
                                                                <input
                                                                    type="tel"
                                                                    name="phone"
                                                                    required
                                                                    value={formData.phone}
                                                                    onChange={handleInputChange}
                                                                    placeholder="+250 788 000 000"
                                                                    className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                />
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Resume / Portfolio Link</label>
                                                                <input
                                                                    type="url"
                                                                    name="portfolioLink"
                                                                    value={formData.portfolioLink}
                                                                    onChange={handleInputChange}
                                                                    placeholder="https://linkedin.com/in/... or drive link"
                                                                    className="block w-full px-4.5 py-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all font-bold"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Cover Letter / Message</label>
                                                            <textarea
                                                                name="coverLetter"
                                                                value={formData.coverLetter}
                                                                onChange={handleInputChange}
                                                                placeholder="Tell us about yourself, why you want to join Kuri Macye, and how your skills fit this position..."
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
                                                                    <><FaSpinner className="animate-spin text-xs" /> Submitting Application...</>
                                                                ) : (
                                                                    <><FaPaperPlane className="text-xs" /> Submit Application</>
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
            </div>

            <LandingFooter />
        </div>
    );
}
