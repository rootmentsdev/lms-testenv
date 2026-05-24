import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Branch from '../model/Branch.js';

const BRANCHES = [
  { locCode: '1',  workingBranch: 'ZORUCCI Edappally',       phoneNumber: '0000000000', location: 'Edappally',       address: 'Edappally, Kochi',          manager: 'TBD' },
  { locCode: '2',  workingBranch: 'GROOMS Kochi',            phoneNumber: '0000000000', location: 'Kochi',           address: 'MG Road, Kochi',            manager: 'TBD' },
  { locCode: '3',  workingBranch: 'GROOMS Edappally',        phoneNumber: '0000000000', location: 'Edappally',       address: 'Edappally, Kochi',          manager: 'TBD' },
  { locCode: '4',  workingBranch: 'GROOMS Calicut',          phoneNumber: '0000000000', location: 'Calicut',         address: 'Calicut',                   manager: 'TBD' },
  { locCode: '5',  workingBranch: 'GROOMS Trivandrum',       phoneNumber: '0000000000', location: 'Trivandrum',      address: 'Trivandrum',                manager: 'TBD' },
  { locCode: '6',  workingBranch: 'ZORUCCI Edappal',         phoneNumber: '0000000000', location: 'Edappal',         address: 'Edappal, Malappuram',       manager: 'TBD' },
  { locCode: '7',  workingBranch: 'ZORUCCI Perinthalmanna',  phoneNumber: '0000000000', location: 'Perinthalmanna',  address: 'Perinthalmanna',            manager: 'TBD' },
  { locCode: '8',  workingBranch: 'ZORUCCI Kottakkal',       phoneNumber: '0000000000', location: 'Kottakkal',       address: 'Kottakkal, Malappuram',     manager: 'TBD' },
  { locCode: '9',  workingBranch: 'GROOMS Kottayam',         phoneNumber: '0000000000', location: 'Kottayam',        address: 'Kottayam',                  manager: 'TBD' },
  { locCode: '10', workingBranch: 'GROOMS Perumbavoor',      phoneNumber: '0000000000', location: 'Perumbavoor',     address: 'Perumbavoor, Ernakulam',    manager: 'TBD' },
  { locCode: '11', workingBranch: 'GROOMS Thrissur',         phoneNumber: '0000000000', location: 'Thrissur',        address: 'Thrissur',                  manager: 'TBD' },
  { locCode: '12', workingBranch: 'GROOMS Chavakkad',        phoneNumber: '0000000000', location: 'Chavakkad',       address: 'Chavakkad, Thrissur',       manager: 'TBD' },
  { locCode: '13', workingBranch: 'GROOMS Kozhikode',        phoneNumber: '0000000000', location: 'Kozhikode',       address: 'Kozhikode',                 manager: 'TBD' },
  { locCode: '14', workingBranch: 'GROOMS Vatakara',         phoneNumber: '0000000000', location: 'Vatakara',        address: 'Vatakara, Kozhikode',       manager: 'TBD' },
  { locCode: '15', workingBranch: 'GROOMS Edappal',          phoneNumber: '0000000000', location: 'Edappal',         address: 'Edappal, Malappuram',       manager: 'TBD' },
  { locCode: '16', workingBranch: 'GROOMS Perinthalmanna',   phoneNumber: '0000000000', location: 'Perinthalmanna',  address: 'Perinthalmanna',            manager: 'TBD' },
  { locCode: '17', workingBranch: 'GROOMS Kottakkal',        phoneNumber: '0000000000', location: 'Kottakkal',       address: 'Kottakkal, Malappuram',     manager: 'TBD' },
  { locCode: '18', workingBranch: 'GROOMS Manjery',          phoneNumber: '0000000000', location: 'Manjery',         address: 'Manjery, Malappuram',       manager: 'TBD' },
  { locCode: '19', workingBranch: 'GROOMS Palakkad',         phoneNumber: '0000000000', location: 'Palakkad',        address: 'Palakkad',                  manager: 'TBD' },
  { locCode: '20', workingBranch: 'GROOMS Kalpetta',         phoneNumber: '0000000000', location: 'Kalpetta',        address: 'Kalpetta, Wayanad',         manager: 'TBD' },
  { locCode: '21', workingBranch: 'GROOMS Kannur',           phoneNumber: '0000000000', location: 'Kannur',          address: 'Kannur',                    manager: 'TBD' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let created = 0, skipped = 0;

  for (const b of BRANCHES) {
    const exists = await Branch.findOne({ locCode: b.locCode });
    if (exists) {
      console.log(`⏭  Skipped (already exists): ${b.workingBranch} [${b.locCode}]`);
      skipped++;
    } else {
      await Branch.create(b);
      console.log(`✅ Created: ${b.workingBranch} [${b.locCode}]`);
      created++;
    }
  }

  console.log(`\nDone — created: ${created}, skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
