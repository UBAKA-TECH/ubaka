import { useState, useEffect } from 'react';
import { FaMobileAlt, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function InstallApp() {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, discard it
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:w-80 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 md:rounded-xl shadow-2xl z-[60] flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaMobileAlt className="text-xl" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">{t('common.install_app.title')}</h3>
                    <p className="text-xs text-white/80">{t('common.install_app.description')}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleInstallClick}
                    className="bg-white text-violet-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                    {t('common.install_app.button')}
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
}
