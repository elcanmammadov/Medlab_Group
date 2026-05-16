const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected...');

    const existing = await Admin.findOne({});

    if (existing) {
      existing.email = 'admin@medlabgroup.org';
      existing.password = 'Medl@b_2020/admin';
      await existing.save();
      console.log('✅ Admin credentials updated successfully!');
    } else {
      await Admin.create({
        username: 'admin',
        email: 'admin@medlabgroup.org',
        password: 'Medl@b_2020/admin',
        role: 'superadmin',
      });
      console.log('✅ Admin created successfully!');
    }

    console.log('Email:    admin@medlabgroup.org');
    console.log('Password: Medl@b_2020/admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdmin();
