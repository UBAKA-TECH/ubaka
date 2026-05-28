import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const initialRoles = [
    {
        id: 'role-1',
        title: 'Fullstack React/Node Engineer',
        department: 'Engineering',
        location: 'Kigali, Rwanda (Hybrid)',
        type: 'Full-Time',
        icon: 'FaLaptopCode',
        description: 'We are looking for a Senior Fullstack Developer to lead the development of our MIS Admin Dashboard and expand our storefront core APIs. You will work on real-time inventory systems, POS integrations, and automated seller tools.',
        requirements: [
            '3+ years experience with React.js, Node.js, and PostgreSQL/Prisma.',
            'Proven experience building SaaS control planes or e-commerce admin panels.',
            'Familiarity with Cloudinary asset storage and WebSockets integrations.',
            'Passion for creating highly responsive, accessible, and premium user experiences.'
        ],
        benefits: [
            'Competitive compensation package & health insurance.',
            'Flexible hybrid working model (2 days remote).',
            'Modern developer workspace in central Kigali.',
            'Annual learning & development allowance.'
        ],
        isActive: true
    },
    {
        id: 'role-2',
        title: 'Graphic & Print Specialist',
        department: 'Production',
        location: 'Kigali HQ',
        type: 'Full-Time',
        icon: 'FaPrint',
        description: 'Help our users turn their ideas into custom physical products. You will oversee print custom queries, quality audits of submitted vector templates (ID cards, banners, frames), and coordinate with the local print manufacturing team.',
        requirements: [
            'Expert knowledge of Adobe Illustrator, Photoshop, and vector graphics file formats.',
            'Experience with industrial printing machinery and paper/material sourcing.',
            'Meticulous eye for detail and print alignment specifications.',
            'Strong communication skills to assist clients with file tweaks.'
        ],
        benefits: [
            'Hands-on experience with state-of-the-art print equipment.',
            'Health and wellness benefits.',
            'Career progression opportunities into Operations Management.'
        ],
        isActive: true
    },
    {
        id: 'role-3',
        title: 'Merchant Onboarding & Growth Lead',
        department: 'Operations',
        location: 'Kigali, Rwanda (Field/Office)',
        type: 'Full-Time',
        icon: 'FaGlobe',
        description: 'Lead our vendor expansion program. You will be responsible for sourcing local merchants, guiding them through the RDB/TIN onboarding checklist, and reviewing submitted KYC files to activate new storefronts.',
        requirements: [
            'Experience in merchant relations, partnership management, or sales operations.',
            'Deep understanding of Rwandan business registration (RDB) and tax systems (RRA).',
            'Empathetic communicator with strong troubleshooting skills.',
            'Self-starter capable of managing partner pipelines.'
        ],
        benefits: [
            'Attractive commission bonus per active store onboarded.',
            'Travel/fuel allowance.',
            'Company smartphone and computing setup.'
        ],
        isActive: true
    },
    {
        id: 'role-4',
        title: 'Sustainability & Solar Program Officer',
        department: 'Impact Projects',
        location: 'Kigali / Remote',
        type: 'Full-Time',
        icon: 'FaLeaf',
        description: 'Direct our environmental impact products portfolio (solar lanterns, clean cookstoves). You will manage relationships with product suppliers, coordinate clean cooking stove logistics, and compile impact statistics for partner reports.',
        requirements: [
            'Degree in Environmental Sciences, Development Studies, or related fields.',
            '1-2 years experience in project logistics or green energy distribution.',
            'Data compilation skills (Excel/CSV dashboarding).',
            'Commitment to promoting eco-friendly alternatives in Rwanda.'
        ],
        benefits: [
            'Opportunity to work on high-impact climate initiatives.',
            'Flexible working hours.',
            'Comprehensive medical insurance coverage.'
        ],
        isActive: true
    }
];

const seedCareers = async () => {
    try {
        console.log("Seeding job listings...");
        for (const role of initialRoles) {
            await prisma.jobListing.upsert({
                where: { id: role.id },
                update: {
                    title: role.title,
                    department: role.department,
                    location: role.location,
                    type: role.type,
                    icon: role.icon,
                    description: role.description,
                    requirements: role.requirements,
                    benefits: role.benefits,
                    isActive: role.isActive
                },
                create: {
                    id: role.id,
                    title: role.title,
                    department: role.department,
                    location: role.location,
                    type: role.type,
                    icon: role.icon,
                    description: role.description,
                    requirements: role.requirements,
                    benefits: role.benefits,
                    isActive: role.isActive
                }
            });
        }
        console.log("✅ Seeded careers successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding careers:", error);
        process.exit(1);
    }
};

seedCareers();
