// Common company email domains that are accepted
export const ALLOWED_COMPANY_DOMAINS = [
  'google.com',
  'microsoft.com',
  'apple.com',
  'amazon.com',
  'meta.com',
  'netflix.com',
  'tesla.com',
  'airbnb.com',
  'uber.com',
  'dropbox.com',
  'slack.com',
  'notion.so',
  'stripe.com',
  'shopify.com',
  'github.com',
  'gitlab.com',
  'adobe.com',
  'salesforce.com',
  'oracle.com',
  'ibm.com',
  'intel.com',
  'nvidia.com',
  'qualcomm.com',
  'vmware.com',
  'workday.com',
  'twilio.com',
  'okta.com',
  'datadog.com',
  'figma.com',
  'canva.com',
  'zoom.com',
  'atlassian.com',
  'jira.com',
  'confluence.org',
];

export const isValidCompanyEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Check against allowed list
  if (ALLOWED_COMPANY_DOMAINS.includes(domain)) {
    return true;
  }
  
  // Reject common free email domains
  const freeEmailDomains = [
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'mail.com',
    'protonmail.com',
    'icloud.com',
    'yandex.com',
  ];
  
  if (freeEmailDomains.includes(domain)) {
    return false;
  }
  
  // For other domains, assume it's a company email unless it's clearly personal
  // This allows for company subdomains like company.example.com
  return !domain.includes('personal') && !domain.includes('private');
};

export const getCompanyFromEmail = (email: string): string => {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  // Remove subdomain if present
  const parts = domain.split('.');
  if (parts.length > 2) {
    return parts.slice(-2).join('.');
  }
  return domain;
};
