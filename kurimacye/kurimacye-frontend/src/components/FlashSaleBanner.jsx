import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import api from '../utils/axiosInstance';

const FlashSaleBanner = () => {
    const { t } = useTranslation();
    const [activeFlashSale, setActiveFlashSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const fetchFlashSale = async () => {
        try {
            const res = await api.get('/flash-sales/active');
            if (res.data.success && res.data.data && res.data.data.length > 0) {
                setActiveFlashSale(res.data.data[0]);
            } else {
                setActiveFlashSale(null);
            }
        } catch (err) {
        }
    };

    useEffect(() => {
        fetchFlashSale();
        // Polling every 5 minutes to check for new sales
        const pollInterval = setInterval(fetchFlashSale, 5 * 60 * 1000);
        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        if (!activeFlashSale) return;

        const targetTime = new Date(activeFlashSale.endDate).getTime();

        const timer = setInterval(() => {
            const now = Date.now();
            const distance = targetTime - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                fetchFlashSale();
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeFlashSale]);

    if (!activeFlashSale) return null;

    return (
        <section className="py-8">
            <div className="mx-auto max-w-7xl px-4">
                <div className={`bg-gradient-to-r ${activeFlashSale.bannerColor || 'from-red-500 to-orange-500'} rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl`}>
                    <div className="text-center md:text-left">
                        <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                            ⚡ {t('home.flash_sale.badge')}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                            {activeFlashSale.name}
                        </h3>
                    </div>
                    <div className="flex gap-3">
                        {[
                            { value: String(timeLeft.days).padStart(2, '0'), label: t('home.flash_sale.days') },
                            { value: String(timeLeft.hours).padStart(2, '0'), label: t('home.flash_sale.hours') },
                            { value: String(timeLeft.minutes).padStart(2, '0'), label: t('home.flash_sale.mins') },
                            { value: String(timeLeft.seconds).padStart(2, '0'), label: t('home.flash_sale.secs') }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="bg-white/10 backdrop-blur-md text-white w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl font-bold mb-1 border border-white/20">
                                    {item.value}
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tighter opacity-80">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/daily-deals" className="bg-white text-red-500 hover:bg-red-50 px-6 py-3 rounded-full font-bold transition shadow-lg flex items-center gap-2 whitespace-nowrap active:scale-95">
                        {t('home.flash_sale.cta')} <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FlashSaleBanner;
