import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaEnvelope, FaPhone, FaMapMarkerAlt
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import api from "../utils/axiosInstance";

export default function LandingFooter() {
  const { t } = useTranslation();
  const [footerData, setFooterData] = useState({
    footerTagline: 'Your premium destination for quality products. Curated collections, exclusive deals, and exceptional service.',
    contactEmail: 'ishfabzele2@gmail.com',
    contactPhone: '+250 789 079 978',
    contactAddress: 'Building near Gicumbi distict office (Eudiose Building)',
    siteName: 'Kuri Macye',
    logo: '/logo.png',
    socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' }
  });
  const [hasPrintingServices, setHasPrintingServices] = useState(false);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await api.get('/site-settings/public');
        const data = res.data; // Axios puts the response body in .data
        if (data.success && data.data) {
          setFooterData(prev => ({
            ...prev,
            footerTagline: data.data.footerTagline || prev.footerTagline,
            socialLinks: data.data.socialLinks || prev.socialLinks
            // Ignored backend overrides for siteName, logo, and contact info to enforce Kuri Macye branding
          }));
        }
      } catch (error) {
      }
    };
    fetchFooterSettings();
  }, []);

  useEffect(() => {
    const checkPrintingServices = async () => {
      try {
        const res = await api.get('/products?tags=printing_service');
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setHasPrintingServices(res.data.data.length > 0);
        }
      } catch (err) {
      }
    };
    checkPrintingServices();
  }, []);

  const socialIcons = [
    { key: 'facebook', Icon: FaFacebookF, url: footerData.socialLinks.facebook },
    { key: 'twitter', Icon: FaTwitter, url: footerData.socialLinks.twitter },
    { key: 'instagram', Icon: FaInstagram, url: footerData.socialLinks.instagram },
    { key: 'linkedin', Icon: FaLinkedinIn, url: footerData.socialLinks.linkedin }
  ];

  return (
    <footer className="bg-white dark:bg-charcoal-800 text-charcoal-600 dark:text-cream-300 border-t border-cream-200 dark:border-charcoal-700 transition-colors duration-300">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center mb-6 no-underline">
              <img src="/logo.svg" alt={footerData.siteName || "Kuri Macye"} width="167" height="40" className="h-10 w-auto object-contain" />
            </Link>

            <p className="text-charcoal-500 dark:text-charcoal-400 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {socialIcons.map(({ key, Icon, url }) => (
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 hover:bg-terracotta-500 dark:hover:bg-terracotta-500 rounded-lg flex items-center justify-center text-charcoal-500 dark:text-charcoal-400 hover:text-white dark:hover:text-white transition-all duration-300"
                  >
                    <Icon />
                  </a>
                ) : (
                  <span
                    key={key}
                    className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-charcoal-400 cursor-default"
                  >
                    <Icon />
                  </span>
                )
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-charcoal-800 dark:text-white font-semibold text-lg mb-6">{t('footer.shop')}</h3>
            <ul className="space-y-3 p-0 list-none">
              {[
                { label: t('footer.all_products'), to: '/shop' },
                hasPrintingServices && { label: t('footer.print_portal'), to: '/print-portal' },
                { label: t('footer.new_arrivals'), to: '/shop?category=new' },
                { label: t('footer.best_sellers'), to: '/shop?sort=popular' },
                { label: t('footer.deals'), to: '/daily-deals' },
                { label: t('footer.gift_cards'), to: '/gift-cards' }
              ].filter(Boolean).map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline text-inherit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-charcoal-800 dark:text-white font-semibold text-lg mb-6">{t('footer.company')}</h3>
            <ul className="space-y-3 p-0 list-none">
              {[
                { label: t('footer.about_us'), to: '/about' },
                { label: t('footer.blog'), to: '/blog' },
                { label: t('footer.contact'), to: '/contact' },
                { label: t('footer.faq'), to: '/faq' },
                { label: t('footer.careers'), to: '/careers' },
                { label: "Become a Seller", to: '/become-seller' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline text-inherit">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-charcoal-800 dark:text-white font-semibold text-lg mb-6">{t('footer.get_in_touch')}</h3>
            <ul className="space-y-4 p-0 list-none">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-terracotta-500 dark:text-terracotta-400">
                  <FaEnvelope />
                </div>
                <span className="text-charcoal-600 dark:text-cream-300">{footerData.contactEmail}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-terracotta-500 dark:text-terracotta-400">
                  <FaPhone />
                </div>
                <span className="text-charcoal-600 dark:text-cream-300">{footerData.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cream-200 dark:bg-charcoal-700 rounded-lg flex items-center justify-center text-terracotta-500 dark:text-terracotta-400 shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <span className="text-charcoal-600 dark:text-cream-300">{t('footer.address')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream-200 dark:border-charcoal-700">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">
              © {new Date().getFullYear()} Kuri Macye. {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline">
                {t('footer.terms')}
              </Link>
              <Link to="/cookies" className="text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors no-underline">
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

