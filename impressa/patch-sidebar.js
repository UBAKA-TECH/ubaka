const fs = require('fs');
const path = require('path');

const applyToSidebar = (name, linkTarget, linkText) => {
    const p = path.join(__dirname, 'abelus-frontend/src/components', name + '.jsx');
    if (!fs.existsSync(p)) return;
    let c = fs.readFileSync(p, 'utf8');

    const adminLink = `<Link to="/admin/abonnes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"><span className="w-5"><FaUserFriends /></span><span>Client Abonnés</span></Link>`;
    const sellerLink = `<Link to="/seller/abonnes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors"><span className="w-5"><FaUserFriends /></span><span>Client Abonnés</span></Link>`;

    const newLink = name === 'Sidebar' ? adminLink : sellerLink;

    if (!c.includes(newLink)) {
        c = c.replace(new RegExp(linkTarget), newLink + '\\n            ' + linkTarget);
    }
    
    if (!c.includes('FaUserFriends')) {
        c = c.replace('import { ', 'import { FaUserFriends, ');
    }

    fs.writeFileSync(p, c, 'utf8');
}

applyToSidebar('Sidebar', '<Link to="/admin/finance"', 'Client Abonnés');
applyToSidebar('SellerSidebar', '<Link to="/seller/payouts"', 'Client Abonnés');
console.log('Sidebars patched');
