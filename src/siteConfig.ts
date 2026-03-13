import { fontProviders } from "astro/config";
/* Icon Imports */
import LinkedInIcon from "./icons/linkedin.svg"
import FacebookIcon from "./icons/facebook.svg"
import InstagramIcon from "./icons/instagram.svg"
import YouTubeIcon from "./icons/youtube.svg"
import TwitterIcon from "./icons/twitterx.svg"

const baseUrl = "https://www.stimsdesign.com";

export const siteConfig = {
    url: baseUrl,
    prettyUrl: "stimsdesign.com",
    logo: "/stimsdesign-logo.svg", /* Path relative to the public directory */
    logoAlt: "/stimsdesign-logo-alt.svg", /* Path relative to the public directory */
    title: "STIMS Design",
    titleStinger: "Bootstrap-based Astro Starter",
    description: "A professional bootstrap-based Astro site.",
    keywords: "Astro, Bootstrap, Starter, Template, Web Design",
    mission: "Merging high-performance engineering with world-class aesthetics. Transcending standard web development to engineer digital assets that accelerate business growth.",
    author: "Stephen Tims",
    brand: "STIMS Design",
    company: "STIMS Design LLC.",
    telephone: "+14807085204",
    prettyTelephone: "(480) 708-5204",
    ogImage: `${baseUrl}/og-image.jpg`, /* Path relative to the public directory */
    fonts: [
        {
            provider: fontProviders.google(),
            name: 'Inter',
            cssVariable: '--font-inter',
        },
        {
            provider: fontProviders.google(),
            name: 'Quicksand',
            cssVariable: '--font-quicksand',
        }
    ],
    socialLinks: [
        { name: 'Facebook', url: 'https://facebook.com/', icon: FacebookIcon },
        { name: 'Instagram', url: 'https://instagram.com/', icon: InstagramIcon },
        { name: 'YouTube', url: 'https://youtube.com/', icon: YouTubeIcon },
        { name: 'LinkedIn', url: 'https://linkedin.com/', icon: LinkedInIcon },
        { name: 'Twitter/X', url: 'https://x.com/', icon: TwitterIcon },
    ],
    // Add other configurable values here
};

export type SiteConfig = typeof siteConfig;