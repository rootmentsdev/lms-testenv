import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../model/Branch.js';

dotenv.config();

function mapStoreToBranch(storeName, branches) {
    if (!storeName) return null;
    const normalizedStore = storeName.toUpperCase().trim();
    
    // Common mappings
    if (normalizedStore === 'SUITOR GUY EDAPPALLY') {
        // G-Edappally
        return branches.find(b => b.workingBranch.toUpperCase().includes('G-EDAPPALLY') || b.workingBranch.toUpperCase().includes('G.EDAPPALLY') || b.workingBranch.toUpperCase() === 'G-EDAPPALLY');
    }
    if (normalizedStore === 'ZORUCCI EDAPPALLY') {
        // Z-Edapally1
        return branches.find(b => b.workingBranch.toUpperCase().includes('Z-EDAPALLY1') || b.workingBranch.toUpperCase().includes('Z-EDAPPALLY'));
    }

    let target = normalizedStore;
    if (target.startsWith('SUITOR GUY ')) {
        const city = target.substring(11).trim();
        target = `G.${city}`;
    } else if (target.startsWith('ZORUCCI ')) {
        const city = target.substring(8).trim();
        target = `Z.${city}`;
    }

    const clean = (s) => s.replace(/[^A-Z0-9]/g, '');
    const cleanTarget = clean(target);
    const cleanStore = clean(normalizedStore);

    // Try exact cleaned match
    for (const b of branches) {
        const wb = b.workingBranch.toUpperCase();
        const cleanWb = clean(wb);
        if (cleanWb === cleanTarget || cleanWb === cleanStore) {
            return b;
        }
    }
    
    // Fallback: search by city name suffix/prefix
    let citySearch = '';
    if (normalizedStore.startsWith('SUITOR GUY ')) {
        citySearch = normalizedStore.substring(11).trim();
    } else if (normalizedStore.startsWith('ZORUCCI ')) {
        citySearch = normalizedStore.substring(8).trim();
    }
    if (citySearch) {
        const cleanCity = clean(citySearch);
        for (const b of branches) {
            const wb = b.workingBranch.toUpperCase();
            if (clean(wb).includes(cleanCity)) {
                return b;
            }
        }
    }
    return null;
}

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        
        const storeNames = await db.collection('imported_employees').distinct('store_name');
        const branches = await Branch.find().lean();
        
        console.log('Testing Store Name Mapping:\n');
        for (const name of storeNames) {
            const match = mapStoreToBranch(name, branches);
            if (match) {
                console.log(`✅ "${name}" -> "${match.workingBranch}" (ID: ${match._id})`);
            } else {
                console.log(`❌ "${name}" -> NO MATCH FOUND`);
            }
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
