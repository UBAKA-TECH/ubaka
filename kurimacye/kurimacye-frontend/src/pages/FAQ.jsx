import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from "../utils/axiosInstance";

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load fallback FAQs from local translation dictionary
  const fallbackFaqs = t('faq.items', { returnObjects: true }) || [];

  useEffect(() => {
    let isMounted = true;
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs/active');
        if (isMounted) {
          if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            setFaqs(response.data.data);
          } else {
            // Fallback if success but data empty
            setFaqs(fallbackFaqs);
          }
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        if (isMounted) {
          // Fallback on API error
          setFaqs(fallbackFaqs);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFaqs();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const getFaqContent = (faq, lang) => {
    // If it's a fallback local translation FAQ (has 'q' and 'a')
    if (faq.q && faq.a) {
      return { question: faq.q, answer: faq.a };
    }
    // If it's a backend FAQ (has 'question', 'answer', and potentially 'Rw' versions)
    if (lang === 'rw') {
      return {
        question: faq.questionRw || faq.question,
        answer: faq.answerRw || faq.answer
      };
    }
    return {
      question: faq.question,
      answer: faq.answer
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-20">
          <div className="animate-pulse text-center">
            <div className="h-9 w-64 bg-cream-300 dark:bg-charcoal-700 rounded mx-auto mb-3"></div>
            <div className="h-4 w-96 bg-cream-300 dark:bg-charcoal-700 rounded mx-auto mb-14"></div>
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-200 dark:border-charcoal-700 overflow-hidden divide-y divide-cream-200 dark:divide-charcoal-700">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="p-6 flex justify-between items-center">
                  <div className="h-5 w-2/3 bg-cream-200 dark:bg-charcoal-700 rounded"></div>
                  <div className="h-7 w-7 bg-cream-200 dark:bg-charcoal-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />

      <main>
        {/* Hero — compact */}
        <section className="relative py-10 md:py-14 overflow-hidden bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-6 left-8 w-52 h-52 bg-terracotta-200 dark:bg-terracotta-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-10 right-10 w-52 h-52 bg-sand-200 dark:bg-sand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-charcoal-800 dark:text-white mb-3 tracking-tight">
              {t('faq.hero_title')}
              <span className="text-terracotta-500 dark:text-terracotta-400">{t('faq.hero_highlight')}</span>
            </h1>
            <p className="text-base text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
              {t('faq.hero_desc')}
            </p>
          </div>
        </section>

        {/* Accordion Section */}
        <section className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden">
            <div className="divide-y divide-cream-200 dark:divide-charcoal-700">
              {Array.isArray(faqs) && faqs.map((item, index) => {
                const { question, answer } = getFaqContent(item, i18n.language);
                return (
                  <div key={item.id || index}>
                    <button
                      className="w-full flex items-center justify-between text-left px-6 py-4 group transition-all"
                      onClick={() => toggleAccordion(index)}
                    >
                      <span className={`text-sm font-bold pr-4 transition-colors leading-snug ${
                        activeIndex === index
                          ? 'text-terracotta-500 dark:text-terracotta-400'
                          : 'text-charcoal-800 dark:text-white group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400'
                      }`}>
                        {question}
                      </span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                        activeIndex === index
                          ? 'bg-terracotta-500 text-white rotate-180'
                          : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-500 dark:text-charcoal-400'
                      }`}>
                        <FaChevronDown className="text-xs" />
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                      activeIndex === index ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-sm text-charcoal-600 dark:text-charcoal-400 leading-relaxed px-6 pb-5 pt-0 border-l-4 border-terracotta-400/30 ml-6">
                        {answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Still have questions CTA */}
          <div className="mt-10 text-center bg-terracotta-500 dark:bg-terracotta-600 rounded-2xl p-8 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-1000 pointer-events-none"></div>
            <h2 className="text-2xl font-black mb-2">{t('faq.still_title')}</h2>
            <p className="text-sm text-terracotta-100 mb-6 max-w-lg mx-auto leading-relaxed">
              {t('faq.still_desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-2.5 bg-white text-terracotta-600 rounded-xl font-bold text-sm hover:bg-cream-100 transition-all shadow-lg active:scale-95 text-center"
              >
                {t('faq.btn_contact')}
              </Link>
              <a
                href="mailto:ishfabzele2@gmail.com"
                className="w-full sm:w-auto px-8 py-2.5 bg-terracotta-600/50 text-white rounded-xl font-bold text-sm hover:bg-terracotta-700 transition-all border border-white/20 active:scale-95 text-center"
              >
                {t('faq.btn_email')}
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

