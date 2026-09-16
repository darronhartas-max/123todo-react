/**
 * 123 To Do - Commercial White-Labeling & Multi-Tenant Configuration
 * 
 * Defines client-specific branding, feature flags, and UI configurations
 * while maintaining a single core codebase and update pipeline for all users.
 */

export const DEFAULT_TENANT_ID = 'default';

export const TENANT_CONFIGS = {
  [DEFAULT_TENANT_ID]: {
    id: DEFAULT_TENANT_ID,
    isDefault: true,
    brandName: '123 To Do',
    tagline: 'Simple, focused daily productivity',
    header: {
      showLogo: true,
      logoLight: '/123-logo-500px-light.png',
      logoDark: '/123-logo-500px-dark.png',
      logoAlt: '123 ToDo logo',
      logoLink: 'https://www.123todo.com',
      badge: null
    },
    footer: {
      partnerBadgeText: null,
      partnerLogo: null, // e.g. { src: string, alt: string, url: string, height?: string }
      copyrightText: `Copyright © Unforgettable Management Ltd ${new Date().getFullYear()}`,
      links: [
        { label: 'Terms of Service', url: 'https://www.123todo.com/terms' },
        { label: 'Privacy Policy', url: 'https://www.123todo.com/privacy' }
      ],
      showVersion: true,
      showAchievements: true,
      showInstallButton: true
    },
    theme: {
      accentColor: null, // null retains default CSS variable
      accentBg: null
    },
    features: {
      socialShare: true,
      achievements: true,
      notesMode: true
    }
  },

  /**
   * Pilot / Demo Commercial Client Configuration
   * Use this as a reference and live test client for your first pilot user.
   * Activated via: ?brand=pilot or ?tenant=pilot
   */
  pilot: {
    id: 'pilot',
    isDefault: false,
    brandName: 'Commercial Pilot',
    tagline: 'Tailored Team Productivity Edition',
    header: {
      badge: 'Pilot Edition'
    },
    footer: {
      partnerBadgeText: 'Custom Edition prepared for Commercial Pilot',
      partnerLogo: null,
      copyrightText: `Copyright © Unforgettable Management Ltd & Commercial Partners ${new Date().getFullYear()}`,
      links: [
        { label: 'Terms of Service', url: 'https://www.123todo.com/terms' },
        { label: 'Privacy Policy', url: 'https://www.123todo.com/privacy' },
        { label: 'Client Support', url: 'https://www.123todo.com' }
      ],
      showVersion: true,
      showAchievements: true,
      showInstallButton: true
    },
    features: {
      socialShare: false, // Disables consumer social share bar for commercial focus
      achievements: true,
      notesMode: true
    }
  }
};

/**
 * Deeply merges a client configuration with default tenant settings.
 * Ensures any omitted properties in client configs safely fallback to defaults.
 */
export const getTenantConfig = (tenantId) => {
  const defaultCfg = TENANT_CONFIGS[DEFAULT_TENANT_ID];
  const clientCfg = TENANT_CONFIGS[tenantId];

  if (!clientCfg || tenantId === DEFAULT_TENANT_ID) {
    return defaultCfg;
  }

  return {
    ...defaultCfg,
    ...clientCfg,
    isDefault: false,
    header: {
      ...defaultCfg.header,
      ...(clientCfg.header || {})
    },
    footer: {
      ...defaultCfg.footer,
      ...(clientCfg.footer || {}),
      links: clientCfg.footer?.links || defaultCfg.footer.links
    },
    theme: {
      ...defaultCfg.theme,
      ...(clientCfg.theme || {})
    },
    features: {
      ...defaultCfg.features,
      ...(clientCfg.features || {})
    }
  };
};
