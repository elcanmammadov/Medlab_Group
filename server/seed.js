const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Company = require('./models/Company');
const Branch = require('./models/Branch');
const Leadership = require('./models/Leadership');
const Media = require('./models/Media');
const BranchService = require('./models/BranchService');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');

    // Clear existing data
    await Admin.deleteMany({});
    await Company.deleteMany({});
    await Branch.deleteMany({});
    await Leadership.deleteMany({});
    await BranchService.deleteMany({});
    await Media.deleteMany({});

    console.log('Cleared existing data...');

    // Create admin user
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@medlabgroup.org',
      password: 'Medl@b_2020/admin',
      role: 'superadmin',
    });

    console.log(`Admin created: ${admin.email} / Medl@b_2020/admin`);

    // Create companies
    const companies = await Company.insertMany([
      {
        name: {
          az: 'Medsun Klinikaları',
          ru: 'Клиники Медсун',
          en: 'Medsun Clinics',
        },
        description: {
          az: 'Müasir avadanlıqlar və peşəkar həkimlərlə təchiz olunmuş geniş klinikalar şəbəkəsi.',
          ru: 'Широкая сеть клиник, оснащенных современным оборудованием и профессиональными врачами.',
          en: 'A wide network of clinics equipped with modern facilities and professional doctors.',
        },
        logo: '/uploads/companies/medsun.png',
        website: 'https://medsun.az',
      },
      {
        name: {
          az: 'Medlab Laboratoriya',
          ru: 'Лаборатория Медлаб',
          en: 'Medlab Laboratory',
        },
        description: {
          az: 'Beynəlxalq standartlara cavab verən yüksək dəqiqlikli diaqnostika və laboratoriya xidmətləri.',
          ru: 'Высокоточная диагностика и лабораторные услуги, соответствующие международным стандартам.',
          en: 'High-precision diagnostics and laboratory services meeting international standards.',
        },
        logo: '/uploads/companies/medlab.png',
        website: 'https://medlab.az',
      },
      {
        name: {
          az: 'Medlab Medical',
          ru: 'Медлаб Медикал',
          en: 'Medlab Medical',
        },
        description: {
          az: 'Peşəkar tibbi xidmətlər və müalicə proqramları təqdim edən sağlamlıq mərkəzi.',
          ru: 'Медицинский центр, предоставляющий профессиональные медицинские услуги и программы лечения.',
          en: 'A health center providing professional medical services and treatment programs.',
        },
        logo: '/uploads/companies/medical.png',
        website: 'https://medlabmedical.az',
      },
    ]);

    console.log(`${companies.length} companies created...`);

    // Create branches
    const branches = await Branch.insertMany([
      {
        company: companies[0]._id,
        name: {
          az: 'Şamaxı Filialı',
          ru: 'Шамахинский филиал',
          en: 'Shamakhi Branch',
        },
        address: {
          az: 'Şamaxı şəhəri, Heydər Əliyev prospekti 12',
          ru: 'г. Шамахи, проспект Гейдара Алиева 12',
          en: '12 Heydar Aliyev Avenue, Shamakhi',
        },
        phone: '+994202550001',
        email: 'samaxi@medsun.az',
        workingHours: '09:00 - 18:00',
        mapLink: 'https://maps.google.com/?q=Shamakhi+Azerbaijan',
        images: [],
      },
      {
        company: companies[1]._id,
        name: {
          az: 'Mərkəzi Laboratoriya',
          ru: 'Центральная лаборатория',
          en: 'Central Laboratory',
        },
        address: {
          az: 'Bakı, Yasamal rayonu, Səhiyyə küçəsi 18',
          ru: 'г. Баку, Ясамальский район, ул. Сехиййе 18',
          en: '18 Sehiyye Street, Yasamal, Baku',
        },
        phone: '+994125550001',
        email: 'info@medlab.az',
        workingHours: '08:00 - 20:00',
        mapLink: 'https://maps.google.com/?q=Baku+Azerbaijan',
        images: [],
      },
      {
        company: companies[2]._id,
        name: {
          az: 'Mərkəz Filialı',
          ru: 'Центральный филиал',
          en: 'Center Branch',
        },
        address: {
          az: 'Bakı, Binəqədi rayonu, Tibb prospekti 7',
          ru: 'г. Баку, Бинагадинский район, проспект Тибб 7',
          en: '7 Tibb Avenue, Binagadi, Baku',
        },
        phone: '+994124440001',
        email: 'info@medlabmedical.az',
        workingHours: '09:00 - 19:00',
        mapLink: 'https://maps.google.com/?q=Binagadi+Baku+Azerbaijan',
        images: [],
      },
    ]);

    console.log(`${branches.length} branches created...`);

    // Create leadership for each company
    const leadership = await Leadership.insertMany([
      {
        companyId: companies[0]._id, // Medsun Clinics
        name: 'Dr. Aysel Məmmədova',
        position: {
          az: 'Baş Direktor',
          ru: 'Генеральный директор',
          en: 'CEO',
        },
        bio: {
          az: '20+ illik tibbi idarəetmə təcrübəsi olan peşəkar rəhbər.',
          ru: 'Профессиональный руководитель с более чем 20-летним опытом управления в медицине.',
          en: 'Professional leader with 20+ years of medical management experience.',
        },
        photo: '/uploads/leadership/aysel.jpg',
      },
      {
        companyId: companies[0]._id, // Medsun Clinics
        name: 'Dr. Rəşad Əliyev',
        position: {
          az: 'Baş Həkim',
          ru: 'Главный врач',
          en: 'Chief Medical Officer',
        },
        bio: {
          az: 'Kardiologiya üzrə mütəxəssis, 15+ illik təcrübə.',
          ru: 'Специалист по кардиологии, более 15 лет опыта.',
          en: 'Cardiology specialist with 15+ years of experience.',
        },
        photo: '/uploads/leadership/rasad.jpg',
      },
      {
        companyId: companies[1]._id, // Medlab Laboratory
        name: 'Dr. Ləman Hüseynova',
        position: {
          az: 'Baş Direktor',
          ru: 'Генеральный директор',
          en: 'Director',
        },
        bio: {
          az: 'Laboratoriya diagnostikası üzrə mütəxəssis, 12+ illik təcrübə.',
          ru: 'Специалист по лабораторной диагностике, более 12 лет опыта.',
          en: 'Laboratory diagnostics specialist with 12+ years of experience.',
        },
        photo: '/uploads/leadership/leman.jpg',
      },
      {
        companyId: companies[2]._id, // Medlab Medical
        name: 'Dr. Kamil Qəhrəmanov',
        position: {
          az: 'Baş Direktor',
          ru: 'Генеральный директор',
          en: 'CEO',
        },
        bio: {
          az: 'Tibbi mərkəzin idarəçiliyi sahəsində 18+ illik təcrübə.',
          ru: 'Более 18 лет опыта в управлении медицинским центром.',
          en: 'Medical center management with 18+ years of experience.',
        },
        photo: '/uploads/leadership/kamil.jpg',
      },
    ]);

    console.log(`${leadership.length} leadership members created...`);

    // Create branch services
    const branchServices = await BranchService.insertMany([
      {
        branch: branches[0]._id,
        name: {
          az: 'Ümumi Tıbbi Konsultasiya',
          ru: 'Общая медицинская консультация',
          en: 'General Medical Consultation',
        },
        image: '/uploads/services/general.jpg',
      },
      {
        branch: branches[0]._id,
        name: {
          az: 'Kardiyologiya',
          ru: 'Кардиология',
          en: 'Cardiology',
        },
        image: '/uploads/services/cardiology.jpg',
      },
      {
        branch: branches[0]._id,
        name: {
          az: 'Laboratoriya Testləri',
          ru: 'Лабораторные тесты',
          en: 'Laboratory Tests',
        },
        image: '/uploads/services/lab.jpg',
      },
      {
        branch: branches[1]._id,
        name: {
          az: 'Qan Analizi',
          ru: 'Анализ крови',
          en: 'Blood Analysis',
        },
        image: '/uploads/services/blood.jpg',
      },
      {
        branch: branches[1]._id,
        name: {
          az: 'Biokimya Testləri',
          ru: 'Биохимические тесты',
          en: 'Biochemistry Tests',
        },
        image: '/uploads/services/biochem.jpg',
      },
      {
        branch: branches[2]._id,
        name: {
          az: 'Qabaqcıl Diaqnostika',
          ru: 'Передовая диагностика',
          en: 'Advanced Diagnostics',
        },
        image: '/uploads/services/diagnostics.jpg',
      },
      {
        branch: branches[2]._id,
        name: {
          az: 'Müalicə Proqramları',
          ru: 'Лечебные программы',
          en: 'Treatment Programs',
        },
        image: '/uploads/services/treatment.jpg',
      },
    ]);

    console.log(`${branchServices.length} branch services created...`);
    const media = await Media.insertMany([
      {
        title: {
          az: 'Medlab Medical Group yeni filial açdı',
          ru: 'Medlab Medical Group открыла новый филиал',
          en: 'Medlab Medical Group opened new branch',
        },
        content: {
          az: 'Medlab Medical Group fəaliyyətini genişləndirməyə davam edir. Yeni filialımız Bakı şəhərində açılmışdır.',
          ru: 'Medlab Medical Group продолжает расширять свою деятельность. Наш новый филиал открыт в городе Баку.',
          en: 'Medlab Medical Group continues to expand its operations. Our new branch has been opened in Baku city.',
        },
        image: '/uploads/media/news1.jpg',
        date: new Date(),
      },
    ]);

    console.log(`${media.length} media items created...`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log(`Email: admin@medlabgroup.org`);
    console.log(`Password: Medl@b_2020/admin`);
    console.log('\nAdmin Panel: http://localhost:5000/admin');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
