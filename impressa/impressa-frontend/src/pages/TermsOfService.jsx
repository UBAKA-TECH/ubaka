import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaFileContract, FaBalanceScale, FaBan, FaSearch, FaGavel, FaEdit } from 'react-icons/fa';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    </div>
                    <div className="relative mx-auto max-w-7xl px-4 text-center">
                        <div className="w-20 h-20 bg-violet-50 dark:bg-violet-900/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-violet-600">
                            <FaFileContract className="text-4xl" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Terms of <span className="text-violet-600 dark:text-violet-400">Service</span></h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Please review the rules and guidelines for using the Impressa platform.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-4xl px-4 py-20">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden p-8 md:p-16 space-y-16">

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600">
                                    <FaBalanceScale className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <FaSearch className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">2. Use License</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Permission is granted to temporarily download one copy of the materials (information or software) on Impressa's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-amber-600">
                                    <FaBan className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">3. Disclaimer</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                The materials on Impressa's website are provided on an 'as is' basis. Impressa makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-600">
                                    <FaEdit className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">4. Limitations</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                In no event shall Impressa or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Impressa's website.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/10 rounded-2xl flex items-center justify-center text-violet-600">
                                    <FaGavel className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">5. Governing Law</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <FaEdit className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">6. Changes to Terms</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                            </p>
                        </section>

                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
};

export default TermsOfService;
