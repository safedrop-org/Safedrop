import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schemaData?: object;
  noIndex?: boolean;
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "سيف دروب - خدمة توصيل آمنة ومضمونة للشحنات الثمينة في السعودية",
  description = "خدمة توصيل احترافية وآمنة للشحنات الثمينة والمهمة في المملكة العربية السعودية. توصيل سريع، تأمين شامل، وتتبع مباشر لشحناتك مع سيف دروب.",
  keywords = "توصيل آمن السعودية, شحن الرياض, توصيل جدة, شحنات ثمينة, توصيل مضمون, خدمة شحن احترافية, تأمين الشحنات, توصيل سريع السعودية, SafeDrop KSA, سيف دروب",
  image = "https://www.safedropksa.com/og-image-safedrop-ksa.jpg",
  url = "https://www.safedropksa.com",
  type = "website",
  schemaData,
  noIndex = false,
  canonical
}) => {
  const siteTitle = "SafeDrop KSA - سيف دروب";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  React.useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
    
    // Update Open Graph tags
    const updateOrCreateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };
    
    updateOrCreateMetaTag('og:title', fullTitle);
    updateOrCreateMetaTag('og:description', description);
    updateOrCreateMetaTag('og:image', image);
    updateOrCreateMetaTag('og:url', url);
    updateOrCreateMetaTag('og:type', type);
    
    // Update Twitter tags
    const updateOrCreateTwitterTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };
    
    updateOrCreateTwitterTag('twitter:title', fullTitle);
    updateOrCreateTwitterTag('twitter:description', description);
    updateOrCreateTwitterTag('twitter:image', image);
    
    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
    
    // Add structured data
    if (schemaData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]#page-schema');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-schema';
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }
    
    // Set robots meta tag
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');
    
  }, [fullTitle, description, keywords, image, url, type, canonical, schemaData, noIndex]);

  return null;
};
