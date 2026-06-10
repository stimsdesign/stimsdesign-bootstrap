
const baseUrl = "https://www.stimsdesign.com";

export const Site = {
    // URLs
    URL: baseUrl,
    PrettyUrl: "stimsdesign.com",
    OgImage: `${baseUrl}/ogimage.png`,
    Favicon: `${baseUrl}/favicon.svg`,

    // Styles
    Theme: "carbon",
    Forms: "laser",

    // SEO
    SiteTitle: "STIMS Design",
    PageTitle: "Bootstrap Astro Starter",
    Title: "STIMS Design",
    TitleStinger: "Bootstrap Astro Starter",
    Description: "A professional bootstrap-based Astro Site.",
    Keywords: "Astro, Bootstrap, Starter, Template, Web Design",
    Mission: "Merging high-performance engineering with world-class aesthetics. Transcending standard web development to engineer digital assets that accelerate business growth.",
    Author: "Stephen Tims",

    // Company Information
    Brand: "STIMS Design",
    Company: "STIMS Design LLC.",
    Telephone: "+14807085204",
    PrettyTelephone: "(480) 708-5204",
    Email: "stimsdesign@gmail.com",
    AddressLine1: "123 Main Street",
    AddressLine2: "Suite 100",
    City: "Phoenix",
    State: "AZ",
    PostalCode: "85001",
    Country: "USA",
    HoursOfOperation: "Mon-Fri 9am-5pm",
    HoursOfOperationWeekend: "Sat-Sun Closed",

    // Navigation
    SiteNavigation: [
        { name: "Blog", href: "/blog.html", icon: "", iconOnly: false },
        { name: "Forms", href: "/forms.html", icon: "forms", iconOnly: false },
        { name: "Services", href: "/services.html", icon: "arrow-down", iconOnly: false },
        { name: "Contact", href: "/contact.html", icon: "phone", iconOnly: false },
    ],
    FooterNavigation: [
        { name: "About", href: "/about.html", icon: "", iconOnly: false },
        { name: "Contact", href: "/contact.html", icon: "", iconOnly: false },
        { name: "Services", href: "/services.html", icon: "", iconOnly: false },
        { name: "Portfolio", href: "/portfolio.html", icon: "", iconOnly: false },
        { name: "Testimonials", href: "/testimonials.html", icon: "", iconOnly: false },
        { name: "Blog", href: "/blog.html", icon: "", iconOnly: false },
        { name: "Privacy Policy", href: "/privacy.html", icon: "", iconOnly: false },
        { name: "Terms of Service", href: "/terms.html", icon: "", iconOnly: false },
    ],
    SocialLinks: [
        { name: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
        { name: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
        { name: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' },
        { name: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
        { name: 'Twitter/X', href: 'https://x.com/', icon: 'twitterx' },
    ],
    MessengerId: "stimsdesign",

    // File Uploads
    DefaultFileSize: 10, // MB
    DefaultFileTypes: "application/pdf, image/jpeg, image/png",

    // Trackers
    GoogleTagManager: "", // GTM-XXXXXXX
    GtmSpaMode: false, // Set to true if GTM is configured to only track via custom pageview events (prevents double-tracking on first load if false)
    GoogleAnalytics: "", // G-XXXXXXX (GA4 direct tag)
    MetaPixel: "", // Facebook Pixel ID (numeric string)
    LinkedInInsight: "", // LinkedIn Partner ID (numeric string)
};

export type Site = typeof Site;