export const NEWSLETTER_TEMPLATES = {
    general_update: {
        label: "General Update",
        subject: "Latest Updates from Kuri Macye",
        fields: [
            { name: "title", label: "Main Title", type: "text", placeholder: "Latest News" },
            { name: "intro", label: "Intro Text", type: "textarea", placeholder: "Hello, We wanted to share..." },
            { name: "subtitle", label: "Section Title", type: "text", placeholder: "What's New?" },
            { name: "points", label: "Bullet Points (one per line)", type: "textarea", placeholder: "New feature updates\nPlatform improvements" },
            { name: "ctaText", label: "Button Text", type: "text", placeholder: "Visit Kuri Macye" },
            { name: "ctaLink", label: "Button Link", type: "text", placeholder: "https://Kuri Macye.com" }
        ],
        html: (values) => {
            const pointsList = values.points
                ? values.points.split('\n').map(p => `<li>${p}</li>`).join('')
                : '<li>New feature updates</li><li>Platform improvements</li>';

            return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; margin-top: 0;">${values.title || 'Latest News'}</h2>
        <p style="color: #666666; line-height: 1.6;">${(values.intro || 'Hello, we wanted to share the latest updates happening at Kuri Macye.').replace(/\n/g, '<br>')}</p>
        
        <h3 style="color: #4a4a4a; margin-top: 25px;">${values.subtitle || "What's New?"}</h3>
        <ul style="color: #666666; line-height: 1.6;">
            ${pointsList}
        </ul>

        <div style="margin-top: 30px; text-align: center;">
            <a href="${values.ctaLink || 'https://Kuri Macye.com'}" style="background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">${values.ctaText || 'Visit Kuri Macye'}</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
        <p style="color: #999999; font-size: 12px; text-align: center;">
            You received this email because you are subscribed to our newsletter.<br>
            Â© ${new Date().getFullYear()} Kuri Macye. All rights reserved.
        </p>
    </div>
</div>`;
        }
    },
    flash_sale: {
        label: "Flash Sale Alert",
        subject: "âš¡ FLASH SALE: Limited Time Offers!",
        fields: [
            { name: "title", label: "Sale Title", type: "text", placeholder: "FLASH SALE" },
            { name: "subtitle", label: "Subtitle", type: "text", placeholder: "Don't miss out! Incredible deals are live right now." },
            { name: "discount", label: "Discount Highlight", type: "text", placeholder: "Up to 50% OFF" },
            { name: "details", label: "Sale Details", type: "textarea", placeholder: "On selected categories. Offer ends soon!" },
            { name: "ctaText", label: "Button Text", type: "text", placeholder: "Shop The Sale Now" },
            { name: "ctaLink", label: "Button Link", type: "text", placeholder: "https://Kuri Macye.com/flash-sales" },
            { name: "terms", label: "Footer Terms", type: "text", placeholder: "*Terms and conditions apply. While stocks last." }
        ],
        html: (values) => {
            return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff0f0; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border-top: 5px solid #ef4444; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);">
        <h1 style="color: #ef4444; text-align: center; margin-top: 0; font-size: 28px;">âš¡ ${values.title || 'FLASH SALE'} âš¡</h1>
        
        <p style="color: #333333; font-size: 18px; text-align: center; line-height: 1.5;">
            ${(values.subtitle || "Don't miss out! Incredible deals are live right now.").replace(/\n/g, '<br>')}
        </p>

        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #991b1b; margin: 0 0 10px 0;">${values.discount || 'Up to 50% OFF'}</h3>
            <p style="color: #b91c1c; margin: 0;">${values.details || 'On selected categories. Offer ends soon!'}</p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <a href="${values.ctaLink || 'https://Kuri Macye.com/flash-sales'}" style="background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">
                ${values.ctaText || 'Shop The Sale Now'}
            </a>
        </div>

        <p style="color: #666666; text-align: center; font-size: 14px;">
            ${values.terms || '*Terms and conditions apply. While stocks last.'}
        </p>
    </div>
</div>`;
        }
    },
    seller_update: {
        label: "Seller Announcement",
        subject: "Important Update for Sellers",
        fields: [
            { name: "title", label: "Announcement Title", type: "text", placeholder: "Seller Update" },
            { name: "intro", label: "Greeting Text", type: "textarea", placeholder: "Dear Partner,\nWe have some important updates..." },
            { name: "highlights", label: "Key Highlights (one per line)", type: "textarea", placeholder: "New analytics tools\nUpdated payout schedule" },
            { name: "ctaText", label: "Button Text", type: "text", placeholder: "Go to Dashboard" },
            { name: "ctaLink", label: "Button Link", type: "text", placeholder: "https://Kuri Macye.com/seller/dashboard" }
        ],
        html: (values) => {
            const highlightsList = values.highlights
                ? values.highlights.split('\n').map(h => `<li>${h}</li>`).join('')
                : '<li>New analytics tools available</li><li>Updated payout schedule</li><li>Performance tips</li>';

            return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0fdf4; padding: 20px;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border-left: 5px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <h2 style="color: #064e3b; margin-top: 0;">${values.title || 'Seller Update'}</h2>
        <p style="color: #374151; line-height: 1.6;">${(values.intro || 'Dear Partner,\nWe have some important updates regarding your seller dashboard and policies.').replace(/\n/g, '<br>')}</p>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <strong style="color: #047857;">Key Highlights:</strong>
            <ul style="color: #065f46; margin-bottom: 0;">
                ${highlightsList}
            </ul>
        </div>

        <div style="margin-top: 25px;">
            <a href="${values.ctaLink || 'https://Kuri Macye.com/seller/dashboard'}" style="color: #059669; text-decoration: none; font-weight: bold;">
                ${values.ctaText || 'Go to Dashboard'} â†’
            </a>
        </div>
    </div>
</div>`;
        }
    },
    premium_offer: {
        label: "Premium Offer",
        subject: "Special Offer: Upgrade Your Experience",
        fields: [
            { name: "title", label: "Hero Title", type: "text", placeholder: "Special Announcement" },
            { name: "subtitle", label: "Subtitle", type: "text", placeholder: "Exclusively for our subscribers" },
            { name: "tag", label: "Tag Text", type: "text", placeholder: "Limited Time" },
            { name: "heading", label: "Body Heading", type: "text", placeholder: "Elevate Your Experience" },
            { name: "message", label: "Body Message", type: "textarea", placeholder: "We've curated a selection of premium products..." },
            { name: "ctaText", label: "Button Text", type: "text", placeholder: "Explore Collection" },
            { name: "ctaLink", label: "Button Link", type: "text", placeholder: "https://Kuri Macye.com" }
        ],
        html: (values) => {
            return `
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 40px 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 800; font-size: 22px; color: #4f46e5; letter-spacing: -0.5px;">Kuri Macye</div>
            <a href="${values.ctaLink || '#'}" style="color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 600;">Shop Now â†’</a>
        </div>

        <!-- Hero Section with Brand Gradient -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); padding: 60px 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 48px; font-weight: 800; letter-spacing: -1px; line-height: 1;">${(values.title || 'Special\nAnnouncement').replace(/\n/g, '<br>')}</h1>
            <p style="font-size: 18px; margin: 15px 0 0 0; opacity: 0.9; font-weight: 500;">${values.subtitle || 'Exclusively for our subscribers'}</p>
            
            <div style="margin-top: 30px;">
                <span style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">${values.tag || 'Limited Time'}</span>
            </div>
        </div>

        <!-- Content Body -->
        <div style="padding: 40px 40px 60px 40px; text-align: center;">
            <h2 style="color: #1e293b; font-size: 26px; margin-bottom: 15px; font-weight: 700;">${values.heading || 'Elevate Your Experience'}</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 35px; max-width: 480px; margin-left: auto; margin-right: auto;">
                ${(values.message || "We've curated a selection of premium products just for you. Discover the latest trends and enjoy exclusive savings available only to our loyal community.").replace(/\n/g, '<br>')}
            </p>

            <a href="${values.ctaLink || '#'}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
                ${values.ctaText || 'Explore Collection'}
            </a>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                    Questions? <a href="#" style="color: #6366f1; text-decoration: none;">Contact Support</a>
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px; font-weight: 500;">Unsubscribe</a>
                <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px; font-weight: 500;">Privacy Policy</a>
            </div>

            <p style="color: #94a3b8; font-size: 11px; line-height: 1.6; margin: 0;">
                Sent with â™¥ by Kuri Macye.<br>
                Â© ${new Date().getFullYear()} Kuri Macye Inc. All rights reserved.
            </p>
        </div>
    </div>
</div>`;
        }
    },
    mint_special: {
        label: "Mint Special Offer",
        subject: "Special Offer: 50% Off Annual Plans",
        fields: [
            { name: "title", label: "Large Value", type: "text", placeholder: "50%" },
            { name: "subtitle", label: "Small Text Next to Value", type: "text", placeholder: "OFF" },
            { name: "description", label: "Offer Description", type: "text", placeholder: "Annual Pro Subscription" },
            { name: "tag", label: "Tag Text", type: "text", placeholder: "Limited Time Only" },
            { name: "heading", label: "Body Heading", type: "textarea", placeholder: "Better products.\nBetter prices." },
            { name: "message", label: "Body Message", type: "textarea", placeholder: "Whether you're shopping for the latest tech..." },
            { name: "ctaText", label: "Button Text", type: "text", placeholder: "Get Kuri Macye Pro" },
            { name: "ctaLink", label: "Button Link", type: "text", placeholder: "https://Kuri Macye.com/pro" },
            { name: "footerText", label: "Expiration Notice", type: "text", placeholder: "Grab this deal before it expires on Jan 14, 2026." }
        ],
        html: (values) => {
            return `
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f2f2f2; padding: 40px 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="padding: 20px 30px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: bold; font-size: 20px; color: #1f2937;">Kuri Macye</div>
            <a href="${values.ctaLink || '#'}" style="color: #0d9488; text-decoration: none; font-size: 14px; font-weight: 600;">Redeem your offer â†’</a>
        </div>

        <!-- Hero Section with Gradient -->
        <div style="background: linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%); padding: 60px 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 56px; font-weight: 300;">${values.title || '50%'} <span style="font-size: 32px;">${values.subtitle || 'OFF'}</span></h1>
            <p style="font-size: 24px; margin: 10px 0 0 0; opacity: 0.9;">${values.description || 'Annual Pro Subscription'}</p>
            
            <!-- Decorative Elements (CSS Shapes) -->
            <div style="margin-top: 30px;">
                <span style="display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 14px;">âœ¨ ${values.tag || 'Limited Time Only'}</span>
            </div>
        </div>

        <!-- Content Body -->
        <div style="padding: 40px 40px 60px 40px; text-align: center;">
            <h2 style="color: #111827; font-size: 28px; margin-bottom: 20px; line-height: 1.3;">${(values.heading || 'Better products.\nBetter prices.').replace(/\n/g, '<br>')}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; max-width: 480px; margin-left: auto; margin-right: auto;">
                ${(values.message || "Whether you're shopping for the latest tech or trending fashion, Kuri Macye Pro helps you save more with exclusive deals and free shipping. Upgrade today to unlock premium benefits.").replace(/\n/g, '<br>')}
            </p>

            <a href="${values.ctaLink || '#'}" style="display: inline-block; background-color: #0f766e; color: white; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(15, 118, 110, 0.4);">
                ${values.ctaText || 'Get Kuri Macye Pro'}
            </a>
            
            <p style="margin-top: 25px; font-size: 13px; color: #6b7280;">
                ${values.footerText || 'Grab this deal before it expires on <strong>January 14, 2026</strong>.'}
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
                <!-- Social Placeholders -->
                <span style="display: inline-block; width: 24px; height: 24px; background: #d1d5db; border-radius: 50%; margin: 0 10px;"></span>
                <span style="display: inline-block; width: 24px; height: 24px; background: #d1d5db; border-radius: 50%; margin: 0 10px;"></span>
                <span style="display: inline-block; width: 24px; height: 24px; background: #d1d5db; border-radius: 50%; margin: 0 10px;"></span>
            </div>
            
            <div style="margin-bottom: 20px;">
                <a href="#" style="color: #6b7280; text-decoration: underline; font-size: 12px; margin: 0 10px;">View Web Version</a>
                <a href="#" style="color: #6b7280; text-decoration: underline; font-size: 12px; margin: 0 10px;">Email Preferences</a>
                <a href="#" style="color: #6b7280; text-decoration: underline; font-size: 12px; margin: 0 10px;">Unsubscribe</a>
            </div>

            <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 0;">
                Promotional price only valid for the first month. Terms apply.<br>
                Â© ${new Date().getFullYear()} Kuri Macye, Inc. All rights reserved.
            </p>
        </div>
    </div>
</div>`;
        }
    },
};

