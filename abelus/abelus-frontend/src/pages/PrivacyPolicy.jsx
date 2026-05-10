import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaShieldAlt, FaLock, FaEye, FaDatabase, FaEnvelope } from 'react-icons/fa';

const PrivacyPolicy = () => {
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
                            <FaShieldAlt className="text-4xl" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Privacy <span className="text-violet-600 dark:text-violet-400">Policy</span></h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            We value your trust and are committed to protecting your personal information.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-4xl px-4 py-20">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden p-8 md:p-16 space-y-16">

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600">
                                    <FaEye className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">1. Introduction</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Welcome to Impressa. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you as to how we look after your personal data when you visit our website
                                and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <FaDatabase className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">2. Information We Collect</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                We collect several different types of information for various purposes to provide and improve our Service to you:
                            </p>
                            <div className="grid gap-6">
                                {[
                                    { title: "Personal Data", desc: "While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you (Name, Email, Phone, Address)." },
                                    { title: "Usage Data", desc: "We may also collect information how the Service is accessed and used (IP address, browser type, pages visited, time spent)." },
                                    { title: "Tracking & Cookies", desc: "We use cookies and similar tracking technologies to track the activity on our Service and hold certain information to enhance your experience." }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-gray-50 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 transition-all hover:border-violet-600/20">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-amber-600">
                                    <FaShieldAlt className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">3. Use of Data</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Impressa uses the collected data for various professional purposes:
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "To provide and maintain our high-quality printing services",
                                    "To notify you about changes to our Service or your order status",
                                    "To allow you to participate in interactive features of our Service",
                                    "To provide elite customer care and prompt support",
                                    "To provide analysis or valuable information to improve the Service"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-violet-600/40 shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-600">
                                    <FaLock className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">4. Data Security</h2>
                            </div>
                            <div className="p-8 bg-violet-50 dark:bg-violet-900/10 border-l-8 border-violet-600/40 rounded-3xl text-lg text-gray-600 dark:text-gray-300 italic">
                                "The security of your data is paramount to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use industry-standard means to protect your Personal Data, we cannot guarantee its absolute security."
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600">
                                    <FaEnvelope className="text-xl" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">5. Contact Us</h2>
                            </div>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                If you have any questions about this Privacy Policy, please reach out to our team at
                                <a href="mailto:support@Impressa.com" className="ml-2 text-violet-600 dark:text-violet-400 font-black hover:underline underline-offset-8 transition-all">
                                    support@Impressa.com
                                </a>.
                            </p>
                        </section>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
};

export default PrivacyPolicy;
