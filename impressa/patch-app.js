const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'abelus-frontend/src/App.js');
let content = fs.readFileSync(targetPath, 'utf8');

// Add imports if they don't exist
if (!content.includes('import AdminAbonne')) {
    content = content.replace(
        /import Login from '\.\/pages\/Login';/,
        `import Login from './pages/Login';\nimport AdminAbonne from './pages/admin/AdminAbonne';\nimport SellerAbonne from './pages/SellerAbonne';`
    );
}

// Add Admin Route
if (!content.includes('<Route path="/admin/abonnes"')) {
    const adminTarget = `<Route path="/admin/pos" element={
                      <ProtectedRoute requireAdmin>
                        <POS />
                      </ProtectedRoute>
                    } />`;
    const adminReplacement = `${adminTarget}\n                    <Route path="/admin/abonnes" element={
                      <ProtectedRoute requireAdmin>
                        <AdminAbonne />
                      </ProtectedRoute>
                    } />`;
    content = content.replace(adminTarget, adminReplacement);
}

// Add Seller Route
if (!content.includes('<Route path="/seller/abonnes"')) {
    const sellerTarget = `<Route path="/seller/pos" element={
                      <ProtectedRoute requireSeller>
                        <SellerPOS />
                      </ProtectedRoute>
                    } />`;
    const sellerReplacement = `${sellerTarget}\n                    <Route path="/seller/abonnes" element={
                      <ProtectedRoute requireSeller>
                        <SellerAbonne />
                      </ProtectedRoute>
                    } />`;
    content = content.replace(sellerTarget, sellerReplacement);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Patched App.js');
