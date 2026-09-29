import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from './model/Branch.js';
import Walkin from './model/Walkin.js';

dotenv.config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms');

const norm = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const locationKey = (loc) => {
    if (!loc) return '';
    const n = norm(loc);
    const prefixes = ['g','z','h','f'];
    for (const p of prefixes) {
        if (n.startsWith(p)) return n.substring(1);
    }
    return n;
};

const resolveStoreConditions = async (storeParam) => {
    const storeArr = storeParam.split(',').map(s => s.trim()).filter(Boolean);
    const allBranches = await Branch.find({}).lean();
    const allWalkinStores = await Walkin.distinct("store").catch(() => []);

    const matchedBranchIds = new Set();
    const matchedStoreNames = new Set();

    storeArr.forEach(s => {
        const key = locationKey(s);
        matchedStoreNames.add(s);

        if (key) {
            allBranches.forEach(b => {
                const bKey = locationKey(b.workingBranch || b.location || "");
                if (bKey === key || norm(b.workingBranch).includes(key)) {
                    if (b._id) matchedBranchIds.add(b._id.toString());
                    if (b.workingBranch) matchedStoreNames.add(b.workingBranch);
                }
            });

            allWalkinStores.forEach(ws => {
                if (typeof ws === 'string') {
                    const wsKey = locationKey(ws);
                    if (wsKey === key || norm(ws).includes(key)) {
                        matchedStoreNames.add(ws);
                    }
                }
            });
        }
    });
    
    return Array.from(matchedStoreNames);
};

async function run() {
    const names = await resolveStoreConditions('SG Edappal');
    console.log("Matched Store Names for SG Edappal:", names);
    process.exit(0);
}
run();
