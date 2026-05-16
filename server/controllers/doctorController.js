const Doctor = require('../models/Doctor');

const getDoctors = async (req, res, next) => {
  try {
    const { companyId, branchId } = req.query;
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (branchId) filter.branchId = branchId;

    const doctors = await Doctor.find(filter)
      .populate('companyId', 'name')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    next(err);
  }
};

const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('companyId', 'name')
      .populate('branchId', 'name');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const { name, surname, companyId, branchId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    if (!companyId) return res.status(400).json({ success: false, message: 'companyId is required' });
    if (!branchId) return res.status(400).json({ success: false, message: 'branchId is required' });

    const position = req.body.position || {};
    const bio = req.body.bio || {};

    const doctorData = {
      name: name.trim(),
      surname: (surname || '').trim(),
      position,
      bio,
      companyId,
      branchId,
    };

    if (req.file) {
      doctorData.image = `/uploads/doctors/${req.file.filename}`;
    }

    const doctor = await Doctor.create(doctorData);
    const populated = await Doctor.findById(doctor._id)
      .populate('companyId', 'name')
      .populate('branchId', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const { name, surname, companyId, branchId } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (surname !== undefined) updateData.surname = surname.trim();
    if (req.body.position) updateData.position = req.body.position;
    if (req.body.bio) updateData.bio = req.body.bio;
    if (companyId) updateData.companyId = companyId;
    if (branchId) updateData.branchId = branchId;
    if (req.file) updateData.image = `/uploads/doctors/${req.file.filename}`;

    doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('companyId', 'name')
      .populate('branchId', 'name');

    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor };
