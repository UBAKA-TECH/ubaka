import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaFileContract, FaBalanceScale, FaBan, FaSearch, FaGavel, FaEdit } from 'react-icons/fa';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-12 md:py-16 bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta-100/20 dark:bg-terracotta-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                        <div className="absolute top-20 right-20 w-72 h-72 bg-sand-100/20 dark:bg-sand-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    </div>
                    <div className="relative mx-auto max-w-7xl px-4 text-center">
                        <div className="w-16 h-16 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-terracotta-500">
                            <FaFileContract className="text-3xl" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-charcoal-900 dark:text-white mb-4">Terms of <span className="text-terracotta-500">Service</span></h1>
                        <p className="text-base text-charcoal-600 dark:text-charcoal-300 max-w-2xl mx-auto leading-relaxed">
                            Please review the rules and guidelines for using the Kuri Macye platform.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-12">
                    <div className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden p-6 md:p-10 space-y-10">

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaBalanceScale className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">1. Acceptance of Terms</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaSearch className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">2. Use License</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                Permission is granted to temporarily download one copy of the materials (information or software) on Kuri Macye's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaBan className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">3. Disclaimer</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                The materials on Kuri Macye's website are provided on an 'as is' basis. Kuri Macye makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaEdit className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">4. Limitations</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                In no event shall Kuri Macye or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Kuri Macye's website.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaGavel className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">5. Governing Law</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-terracotta-50 dark:bg-terracotta-950/20 rounded-xl flex items-center justify-center text-terracotta-500">
                                    <FaEdit className="text-lg" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 dark:text-white">6. Changes to Terms</h2>
                            </div>
                            <p className="text-base text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
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
