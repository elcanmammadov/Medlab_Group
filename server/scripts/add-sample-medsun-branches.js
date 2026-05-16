const dotenv = require('dotenv');
const mongoose = require('mongoose');

const dbConnect = require('../config/db');
const Company = require('../models/Company');
const Branch = require('../models/Branch');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

async function ensureBranch(companyId, branch) {
  const exists = await Branch.findOne({ company: companyId, 'name.az': branch.name.az });
  if (exists) return { status: 'exists', id: exists._id };

  const created = await Branch.create({ ...branch, company: companyId });
  return { status: 'created', id: created._id };
}

async function main() {
  await dbConnect();

  const medsun =
    (await Company.findOne({ website: /medsun\.az/i })) ||
    (await Company.findOne({ 'name.az': /medsun/i })) ||
    (await Company.findOne({ 'name.en': /medsun/i }));

  if (!medsun) {
    throw new Error('Medsun company not found. Create it in Admin → Companies first.');
  }

  const samples = [
    {
      name: { az: 'Şamaxı filialı', ru: 'Шемахинский филиал', en: 'Shamakhi Branch' },
      address: {
        az: 'Şamaxı şəhəri, Heydər Əliyev prospekti 12',
        ru: 'г. Шемаха, проспект Гейдара Алиева 12',
        en: '12 Heydar Aliyev Avenue, Shamakhi',
      },
      phone: '+994202550001',
      email: 'samaxi@medsun.az',
      workingHours: '09:00 - 18:00',
      mapLink: 'https://maps.google.com/?q=Shamakhi+Azerbaijan',
      images: [],
      doctors: [
        { name: 'Dr. Fərhad Əliyev', role: 'Kardioloq' },
        { name: 'Dr. Aynur Məmmədova', role: 'Terapevt' },
      ],
    },
    {
      name: { az: 'Kürdəmir filialı', ru: 'Кюрдамирский филиал', en: 'Kurdamir Branch' },
      address: {
        az: 'Kürdəmir şəhəri, Mərkəz küçəsi 5',
        ru: 'г. Кюрдамир, Центральная улица 5',
        en: '5 Central Street, Kurdamir',
      },
      phone: '+994202550002',
      email: 'kurdemir@medsun.az',
      workingHours: '09:00 - 18:00',
      mapLink: 'https://maps.google.com/?q=Kurdamir+Azerbaijan',
      images: [],
      doctors: [
        { name: 'Dr. Tural İsmayılov', role: 'Ailə həkimi' },
        { name: 'Dr. Elvin Məmmədov', role: 'Pediatr' },
      ],
    },
  ];

  const results = [];
  for (const sample of samples) {
    // eslint-disable-next-line no-await-in-loop
    const r = await ensureBranch(medsun._id, sample);
    results.push({ branch: sample.name.az, ...r });
  }

  console.log('Medsun sample branches:', results);
}

main()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err.message || err);
    mongoose.connection.close().catch(() => {});
    process.exitCode = 1;
  });

