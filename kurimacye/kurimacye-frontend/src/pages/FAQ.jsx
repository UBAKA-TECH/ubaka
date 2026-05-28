import React, { useState } from 'react';
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "How long does delivery take?",
            answer: "Standard delivery typically takes 3-5 business days within the country. International delivery can take 7-14 business days depending on the destination."
        },
        {
            question: "What is your return policy?",
            answer: "We accept returns within 30 days of purchase. The item must be unused and in its original packaging. Please contact our support team to initiate a return."
        },
        {
            question: "How can I track my order?",
            answer: "Yes, once your order is shipped, you will receive a tracking number via email. You can also use the 'Track Order' link in the footer to check your status."
        },
        {
            question: "Do you offer international delivery?",
            answer: "Yes, we deliver to most countries worldwide. Delivery costs and times vary based on location."
        },
        {
            question: "How can I contact customer support?",
            answer: "You can reach our customer support team via email at support@kurimacye.rw or by calling +250 000 000 000 during business hours."
        }
    ];

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
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">Frequently Asked <span className="text-violet-600 dark:text-violet-400">Questions</span></h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Everything you need to know about our products and services.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-4xl px-4 py-20">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden p-8 md:p-12">
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {faqs.map((faq, index) => (
                                <div key={index} className="py-6">
                                    <button
                                        className="w-full flex items-center justify-between text-left group transition-all"
                                        onClick={() => toggleAccordion(index)}
                                    >
                                        <span className={`text-xl font-bold transition-colors ${activeIndex === index ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400'}`}>
                                            {faq.question}
                                        </span>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeIndex === index ? 'bg-violet-600 text-white rotate-180' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                                            <span className="text-2xl font-light">{activeIndex === index ? '−' : '+'}</span>
                                        </div>
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${activeIndex === index ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'}`}
                                    >
                                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed pl-2 border-l-4 border-violet-600/20 dark:border-violet-400/20">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-20 text-center bg-violet-600 rounded-[40px] p-12 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 transform group-hover:scale-150 transition-transform duration-1000"></div>
                        <h2 className="text-3xl font-black mb-6">Still have questions?</h2>
                        <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto font-medium">
                            If you couldn't find the answer you're looking for, our friendly support team is here to help you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a
                                href="/contact"
                                className="w-full sm:w-auto px-10 py-5 bg-white text-violet-600 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-2xl active:scale-95 text-center"
                            >
                                Contact Support
                            </a>
                            <a
                                href="mailto:support@kurimacye.rw"
                                className="w-full sm:w-auto px-10 py-5 bg-violet-700/50 text-white rounded-2xl font-black text-lg hover:bg-violet-700 transition-all border border-white/20 active:scale-95 text-center"
                            >
                                Email Us
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
};

export default FAQ;
