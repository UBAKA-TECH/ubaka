import locationsData from '../data/rwandaLocations.json';

// Get unique Provinces
export const getProvinces = () => {
    const provinces = [...new Set(locationsData.map(item => item.province_name))];
    return provinces.sort();
};

// Get Districts for a Province
export const getDistricts = (provinceName) => {
    if (!provinceName) return [];
    const districts = [...new Set(
        locationsData
            .filter(item => item.province_name === provinceName)
            .map(item => item.district_name)
    )];
    return districts.sort();
};

// Get Sectors for a District
export const getSectors = (districtName) => {
    if (!districtName) return [];
    const sectors = [...new Set(
        locationsData
            .filter(item => item.district_name === districtName)
            .map(item => item.sector_name)
    )];
    return sectors.sort();
};

// Get Cells for a Sector
export const getCells = (sectorName) => {
    if (!sectorName) return [];
    const cells = [...new Set(
        locationsData
            .filter(item => item.sector_name === sectorName)
            .map(item => item.cell_name)
    )];
    return cells.sort();
};

// Get Villages for a Cell (Optional, if needed later)
export const getVillages = (cellName) => {
    if (!cellName) return [];
    const villages = [...new Set(
        locationsData
            .filter(item => item.cell_name === cellName)
            .map(item => item.village_name)
    )];
    return villages.sort();
};
