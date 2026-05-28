import prisma, { isDbConnected } from './db.js';

// Define all granular permissions
export const ALL_PERMISSIONS = [
  { code: 'manage_users', name: 'Manage Users', description: 'Create, update, or disable employee accounts', system: 'Ubaka Tech MIS' },
  { code: 'manage_delegations_hr', name: 'Manage HR Delegations', description: 'Create and revoke temporary coverages for operational roles', system: 'Ubaka Tech MIS' },
  { code: 'manage_delegations_admin', name: 'Manage Admin Delegations', description: 'Create and revoke coverages for technical/admin roles', system: 'Ubaka Tech MIS' },
  
  // 32 Grouped Kuri Macye E-Commerce Admin Features
  { code: 'manage_impressa_users', name: 'Users', description: 'Manage e-commerce customer and cashier accounts', system: 'Kuri Macye' },
  { code: 'manage_impressa_sellers', name: 'Sellers', description: 'Manage platform merchant seller profiles', system: 'Kuri Macye' },
  { code: 'manage_impressa_violations', name: 'Violations', description: 'Auto-detect, issue, or resolve merchant policy violations', system: 'Kuri Macye' },
  { code: 'view_impressa_seller_reports', name: 'Seller Reports', description: 'View seller sales performance, payouts, and activity logs', system: 'Kuri Macye' },
  { code: 'manage_impressa_orders', name: 'Orders', description: 'View and update order processing and delivery portals', system: 'Kuri Macye' },
  { code: 'manage_impressa_inquiries', name: 'Inquiries / Quotes', description: 'Manage client custom quote requests and inquiries', system: 'Kuri Macye' },
  { code: 'manage_impressa_products', name: 'Products', description: 'Manage e-commerce product catalog inventory', system: 'Kuri Macye' },
  { code: 'approve_impressa_products', name: 'Product Approval', description: 'Review and approve vendor products in Kuri Macye catalog', system: 'Kuri Macye' },
  { code: 'manage_impressa_shifts', name: 'Shifts', description: 'Track employee POS shifts and drawer cash reconciliation', system: 'Kuri Macye' },
  { code: 'manage_impressa_categories', name: 'Categories', description: 'Manage catalog store categories', system: 'Kuri Macye' },
  { code: 'manage_impressa_attributes', name: 'Attributes', description: 'Manage product custom fields and attributes', system: 'Kuri Macye' },
  { code: 'manage_impressa_reviews', name: 'Reviews', description: 'Monitor and moderate customer product reviews', system: 'Kuri Macye' },
  { code: 'manage_impressa_tickets', name: 'Support Tickets', description: 'Respond to client help requests and tickets', system: 'Kuri Macye' },
  { code: 'manage_impressa_customer_queries', name: 'AI Customer Queries', description: 'Oversee and audit automated chatbot conversations', system: 'Kuri Macye' },
  { code: 'manage_impressa_abonnes', name: 'Client Abonnés', description: 'Manage subscribers and abonne accounts', system: 'Kuri Macye' },
  { code: 'manage_impressa_coupons', name: 'Coupons', description: 'Manage marketing and discount coupons', system: 'Kuri Macye' },
  { code: 'manage_impressa_gift_cards', name: 'Gift Cards', description: 'Issue and track digital gift cards', system: 'Kuri Macye' },
  { code: 'manage_impressa_gift_card_products', name: 'Gift Card Products', description: 'Configure purchaseable gift card types', system: 'Kuri Macye' },
  { code: 'manage_impressa_flash_sales', name: 'Flash Sales', description: 'Configure active promotional campaigns and discounts', system: 'Kuri Macye' },
  { code: 'manage_impressa_banners', name: 'Banners', description: 'Manage landing page promotional banners', system: 'Kuri Macye' },
  { code: 'manage_impressa_testimonials', name: 'Testimonials', description: 'Moderate client platform testimonials', system: 'Kuri Macye' },
  { code: 'manage_impressa_blogs', name: 'Blogs', description: 'Publish and edit articles on the Kuri Macye Blog', system: 'Kuri Macye' },
  { code: 'manage_impressa_brand_partners', name: 'Brand Partners', description: 'Manage vendor brand partnerships and logos', system: 'Kuri Macye' },
  { code: 'manage_impressa_finance', name: 'Finance', description: 'View financial balance sheets and transactions', system: 'Kuri Macye' },
  { code: 'manage_impressa_commissions', name: 'Commissions', description: 'Configure platform fee rates', system: 'Kuri Macye' },
  { code: 'manage_impressa_payouts', name: 'Payouts', description: 'Process merchant payouts and withdrawals', system: 'Kuri Macye' },
  { code: 'manage_impressa_site_settings', name: 'Site Settings', description: 'Edit general e-commerce configuration', system: 'Kuri Macye' },
  { code: 'manage_impressa_subscribers', name: 'Subscribers', description: 'Manage email newsletter subscribers', system: 'Kuri Macye' },
  { code: 'manage_impressa_delivery', name: 'Delivery', description: 'Configure shipping zones and delivery rates', system: 'Kuri Macye' },
  { code: 'manage_impressa_taxes', name: 'Taxes', description: 'Configure value added tax rates', system: 'Kuri Macye' },
  { code: 'manage_impressa_reports', name: 'Reports', description: 'Download PDF tax and sale statements', system: 'Kuri Macye' },
  { code: 'manage_impressa_email_templates', name: 'Email Templates', description: 'Manage and preview email notification templates', system: 'Kuri Macye' },
  { code: 'manage_impressa_settings', name: 'Settings', description: 'Configure system backend integrations', system: 'Kuri Macye' },

  { code: 'view_analytics', name: 'View Business Analytics', description: 'View system usage, e-commerce revenues, and performance charts', system: 'Ubaka Tech MIS' },
  { code: 'manage_tasks', name: 'Manage Project Tasks', description: 'Create, assign, edit, and move Kanban board tasks', system: 'Ubaka Tech MIS' },
  { code: 'view_tasks', name: 'View Project Tasks', description: 'Read tasks on the Kanban board', system: 'Ubaka Tech MIS' },
  { code: 'write_code', name: 'Write Code', description: 'Commit code and view repository status', system: 'Developer' },
  { code: 'approve_code', name: 'Approve Code merges', description: 'Perform technical design and pull request code reviews', system: 'Developer' },
  { code: 'restart_services', name: 'Manage Services & Servers', description: 'DevOps capability to restart production modules and logs', system: 'Developer' },
  { code: 'log_time', name: 'Log Work Hours', description: 'Submit time logs for tasks', system: 'Ubaka Tech MIS' },
  { code: 'manage_hr', name: 'Manage HR Portal', description: 'Full access to HR onboarding, approvals, hardware fleet, SaaS licenses, and people analytics', system: 'Ubaka Tech MIS' },
  { code: 'submit_requests', name: 'Submit HR Requests', description: 'Submit time-off, expense, and hardware requests via the HR portal', system: 'Ubaka Tech MIS' },
];

// Define all roles and map their permission codes
export const ALL_ROLES = [
  {
    code: 'sysadmin',
    name: 'System Administrator',
    description: 'Full root access to system settings, databases, and delegations',
    isTechnical: true,
    permissions: [
      'manage_users',
      'manage_delegations_hr',
      'manage_delegations_admin',
      'view_analytics',
      'manage_tasks',
      'view_tasks',
      'write_code',
      'approve_code',
      'restart_services',
      'log_time',
      'manage_hr',
      'submit_requests',
      // Kuri Macye Permissions (32 features)
      'manage_impressa_users',
      'manage_impressa_sellers',
      'manage_impressa_violations',
      'view_impressa_seller_reports',
      'manage_impressa_orders',
      'manage_impressa_inquiries',
      'manage_impressa_products',
      'approve_impressa_products',
      'manage_impressa_shifts',
      'manage_impressa_categories',
      'manage_impressa_attributes',
      'manage_impressa_reviews',
      'manage_impressa_tickets',
      'manage_impressa_customer_queries',
      'manage_impressa_abonnes',
      'manage_impressa_coupons',
      'manage_impressa_gift_cards',
      'manage_impressa_gift_card_products',
      'manage_impressa_flash_sales',
      'manage_impressa_banners',
      'manage_impressa_testimonials',
      'manage_impressa_blogs',
      'manage_impressa_brand_partners',
      'manage_impressa_finance',
      'manage_impressa_commissions',
      'manage_impressa_payouts',
      'manage_impressa_site_settings',
      'manage_impressa_subscribers',
      'manage_impressa_delivery',
      'manage_impressa_taxes',
      'manage_impressa_reports',
      'manage_impressa_settings',
      'manage_impressa_email_templates'
    ]
  },
  {
    code: 'hr_manager',
    name: 'HR Manager',
    description: 'Manages company staff directory and schedules operational coverage',
    isTechnical: false,
    permissions: ['manage_users', 'manage_delegations_hr', 'view_analytics', 'view_tasks', 'log_time', 'manage_hr', 'submit_requests']
  },
  {
    code: 'product_manager',
    name: 'Product Manager',
    description: 'Orchestrates project tasks and coordinates deliverables',
    isTechnical: false,
    permissions: ['manage_tasks', 'view_tasks', 'view_analytics', 'log_time', 'submit_requests']
  },
  {
    code: 'ux_designer',
    name: 'UX/UI Designer',
    description: 'Designs beautiful human-centered user experiences',
    isTechnical: false,
    permissions: ['view_tasks', 'log_time', 'submit_requests']
  },
  {
    code: 'lead_engineer',
    name: 'Lead Software Architect',
    description: 'Architects codebase structures and reviews developer contributions',
    isTechnical: true,
    permissions: ['write_code', 'approve_code', 'manage_tasks', 'view_tasks', 'log_time', 'submit_requests']
  },
  {
    code: 'software_engineer',
    name: 'Software Engineer',
    description: 'Develops features and fixes bugs across monorepo packages',
    isTechnical: true,
    permissions: ['write_code', 'view_tasks', 'log_time', 'submit_requests']
  },
  {
    code: 'qa_engineer',
    name: 'Quality Assurance Engineer',
    description: 'Tests applications, logs bug tasks, and audits release readiness',
    isTechnical: false,
    permissions: ['manage_tasks', 'view_tasks', 'log_time', 'submit_requests']
  },
  {
    code: 'devops',
    name: 'DevOps / SRE Engineer',
    description: 'Deploys updates, scales databases, and keeps servers healthy',
    isTechnical: true,
    permissions: ['restart_services', 'view_analytics', 'log_time', 'submit_requests']
  },
  {
    code: 'security_engineer',
    name: 'Security Analyst',
    description: 'Audits logs, enforces access tokens, and scans for threats',
    isTechnical: true,
    permissions: ['view_analytics', 'log_time', 'submit_requests']
  },
  {
    code: 'content_controller',
    name: 'Content Controller',
    description: 'Reviews and approves e-commerce product listings for Kuri Macye',
    isTechnical: false,
    permissions: ['approve_impressa_products', 'moderate_impressa_content', 'log_time', 'submit_requests']
  },
  {
    code: 'customer_support',
    name: 'Customer Support Agent',
    description: 'Resolves merchant questions and escalates technical issues',
    isTechnical: false,
    permissions: ['manage_impressa_tickets', 'log_time', 'submit_requests']
  },
  {
    code: 'growth_marketer',
    name: 'Growth Marketer',
    description: 'Tracks metrics and runs campaigns to boost active users',
    isTechnical: false,
    permissions: ['view_analytics', 'log_time', 'submit_requests']
  },
  {
    code: 'ceo',
    name: 'Chief Executive Officer (CEO)',
    description: 'Executive oversight of global operations, business metrics, and strategic project goals',
    isTechnical: false,
    permissions: ['view_analytics', 'view_tasks', 'moderate_impressa_content', 'manage_impressa_tickets', 'log_time', 'submit_requests']
  },
  {
    code: 'cto',
    name: 'Chief Technology Officer (CTO)',
    description: 'Directs the technology strategy, oversees security audits, and guides engineering teams',
    isTechnical: true,
    permissions: ['view_analytics', 'write_code', 'approve_code', 'restart_services', 'manage_tasks', 'view_tasks', 'log_time']
  },
  {
    code: 'cfo',
    name: 'Chief Financial Officer (CFO)',
    description: 'Oversees financial reporting, revenue audit reconciliations, and budgeting',
    isTechnical: false,
    permissions: ['view_analytics', 'log_time']
  },
  {
    code: 'coo',
    name: 'Chief Operating Officer (COO)',
    description: 'Maintains operational alignment across departments, HR systems, and project execution',
    isTechnical: false,
    permissions: ['view_analytics', 'manage_tasks', 'view_tasks', 'manage_users', 'manage_delegations_hr', 'log_time', 'manage_hr', 'submit_requests']
  },
  {
    code: 'custom_permissions',
    name: 'Custom Permissions',
    description: 'Dynamic coverage for specific selected features/permissions',
    isTechnical: false,
    permissions: []
  }
];

// Helper to seed roles and permissions into database if connected
export const seedRolesAndPermissions = async () => {
  const connected = await isDbConnected();
  if (!connected) {
    console.log('⚠️ Database disconnected. Skipping DB seeding of Roles & Permissions.');
    return;
  }

  try {
    const permCount = await prisma.permission.count();
    const roleCount = await prisma.role.count();
    if (permCount === ALL_PERMISSIONS.length && roleCount === ALL_ROLES.length) {
      console.log('✅ Dynamic Roles & Permissions are already up-to-date. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding dynamic Roles & Permissions to Database...');

    // 1. Create permissions
    for (const perm of ALL_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { code: perm.code },
        update: { name: perm.name, description: perm.description },
        create: { code: perm.code, name: perm.name, description: perm.description }
      });
    }

    // 2. Create roles and link permissions
    for (const roleData of ALL_ROLES) {
      const dbRole = await prisma.role.upsert({
        where: { code: roleData.code },
        update: { name: roleData.name, description: roleData.description, isTechnical: roleData.isTechnical },
        create: { code: roleData.code, name: roleData.name, description: roleData.description, isTechnical: roleData.isTechnical }
      });

      // Clear existing RolePermissions for this role to avoid duplicates
      await prisma.rolePermission.deleteMany({
        where: { roleId: dbRole.id }
      });

      // Link new permissions
      for (const permCode of roleData.permissions) {
        const dbPerm = await prisma.permission.findUnique({ where: { code: permCode } });
        if (dbPerm) {
          await prisma.rolePermission.create({
            data: {
              roleId: dbRole.id,
              permissionId: dbPerm.id
            }
          });
        }
      }
    }

    console.log('✅ Dynamic Roles & Permissions seed finished successfully.');
  } catch (error) {
    console.error('❌ Failed to seed dynamic Roles & Permissions:', error.message);
  }
};
