import prisma, { isDbConnected } from './db.js';

// Define all granular permissions
export const ALL_PERMISSIONS = [
  { code: 'manage_users', name: 'Manage Users', description: 'Create, update, or disable employee accounts' },
  { code: 'manage_delegations_hr', name: 'Manage HR Delegations', description: 'Create and revoke temporary coverages for operational roles' },
  { code: 'manage_delegations_admin', name: 'Manage Admin Delegations', description: 'Create and revoke coverages for technical/admin roles' },
  { code: 'approve_products', name: 'Approve E-Commerce Products', description: 'Review and approve vendor products in Impressa catalog' },
  { code: 'moderate_content', name: 'Moderate Platform Content', description: 'Review and flag user generated reviews and listings' },
  { code: 'view_analytics', name: 'View Business Analytics', description: 'View system usage, e-commerce revenues, and performance charts' },
  { code: 'manage_tasks', name: 'Manage Project Tasks', description: 'Create, assign, edit, and move Kanban board tasks' },
  { code: 'view_tasks', name: 'View Project Tasks', description: 'Read tasks on the Kanban board' },
  { code: 'write_code', name: 'Write Code', description: 'Commit code and view repository status' },
  { code: 'approve_code', name: 'Approve Code merges', description: 'Perform technical design and pull request code reviews' },
  { code: 'restart_services', name: 'Manage Services & Servers', description: 'DevOps capability to restart production modules and logs' },
  { code: 'manage_tickets', name: 'Manage Support Tickets', description: 'View and respond to client help requests' },
  { code: 'log_time', name: 'Log Work Hours', description: 'Submit time logs for tasks' },
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
      'approve_products',
      'moderate_content',
      'view_analytics',
      'manage_tasks',
      'view_tasks',
      'write_code',
      'approve_code',
      'restart_services',
      'manage_tickets',
      'log_time'
    ]
  },
  {
    code: 'hr_manager',
    name: 'HR Manager',
    description: 'Manages company staff directory and schedules operational coverage',
    isTechnical: false,
    permissions: ['manage_users', 'manage_delegations_hr', 'view_analytics', 'view_tasks', 'log_time']
  },
  {
    code: 'product_manager',
    name: 'Product Manager',
    description: 'Orchestrates project tasks and coordinates deliverables',
    isTechnical: false,
    permissions: ['manage_tasks', 'view_tasks', 'view_analytics', 'log_time']
  },
  {
    code: 'ux_designer',
    name: 'UX/UI Designer',
    description: 'Designs beautiful human-centered user experiences',
    isTechnical: false,
    permissions: ['view_tasks', 'log_time']
  },
  {
    code: 'lead_engineer',
    name: 'Lead Software Architect',
    description: 'Architects codebase structures and reviews developer contributions',
    isTechnical: true,
    permissions: ['write_code', 'approve_code', 'manage_tasks', 'view_tasks', 'log_time']
  },
  {
    code: 'software_engineer',
    name: 'Software Engineer',
    description: 'Develops features and fixes bugs across monorepo packages',
    isTechnical: true,
    permissions: ['write_code', 'view_tasks', 'log_time']
  },
  {
    code: 'qa_engineer',
    name: 'Quality Assurance Engineer',
    description: 'Tests applications, logs bug tasks, and audits release readiness',
    isTechnical: false,
    permissions: ['manage_tasks', 'view_tasks', 'log_time']
  },
  {
    code: 'devops',
    name: 'DevOps / SRE Engineer',
    description: 'Deploys updates, scales databases, and keeps servers healthy',
    isTechnical: true,
    permissions: ['restart_services', 'view_analytics', 'log_time']
  },
  {
    code: 'security_engineer',
    name: 'Security Analyst',
    description: 'Audits logs, enforces access tokens, and scans for threats',
    isTechnical: true,
    permissions: ['view_analytics', 'log_time']
  },
  {
    code: 'content_controller',
    name: 'Content Controller',
    description: 'Reviews and approves e-commerce product listings for Impressa',
    isTechnical: false,
    permissions: ['approve_products', 'moderate_content', 'log_time']
  },
  {
    code: 'customer_support',
    name: 'Customer Support Agent',
    description: 'Resolves merchant questions and escalates technical issues',
    isTechnical: false,
    permissions: ['manage_tickets', 'log_time']
  },
  {
    code: 'growth_marketer',
    name: 'Growth Marketer',
    description: 'Tracks metrics and runs campaigns to boost active users',
    isTechnical: false,
    permissions: ['view_analytics', 'log_time']
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
