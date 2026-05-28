/**
 * Barcode Generation Utility
 * Generates alphanumeric barcodes for products without manufacturer barcodes
 */

/**
 * Generate an alphanumeric barcode
 * Format: IMP-XXXXXXXXXX (13 characters total)
 * Example: IMP-A7K3X9M2N1
 */
export const generateBarcode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars: I, O, 0, 1
    let code = 'IMP-';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * Validate barcode format
 * Accepts: EAN-13, UPC-A, custom alphanumeric
 */
export const isValidBarcode = (barcode) => {
    if (!barcode || typeof barcode !== 'string') return false;

    // Allow alphanumeric barcodes between 4-20 characters
    const alphanumericPattern = /^[A-Za-z0-9\-]{4,20}$/;
    return alphanumericPattern.test(barcode);
};

/**
 * Normalize barcode (uppercase, trim)
 */
export const normalizeBarcode = (barcode) => {
    if (!barcode) return null;
    return barcode.trim().toUpperCase();
};

export default {
    generateBarcode,
    isValidBarcode,
    normalizeBarcode
};
