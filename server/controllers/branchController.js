const Branch = require('../models/Branch');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
const getBranches = async (req, res, next) => {
  try {
    const { company, search } = req.query;

    const filter = {};

    // Filter by company
    if (company) {
      filter.company = company;
    }

    // Search by name
    if (search) {
      filter.$or = [
        { 'name.az': { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
      ];
    }

    const branches = await Branch.find(filter).populate('company', 'name').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Public
const getBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('company', 'name');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create branch
// @route   POST /api/branches
// @access  Private
const createBranch = async (req, res, next) => {
  try {
    const { company, name, address, email, workingHours, mapLink } = req.body;

    let phones = [];
    if (req.body.phones) {
      try { phones = JSON.parse(req.body.phones); } catch { phones = []; }
    }

    const branchData = {
      company,
      name: name || {},
      address: address || {},
      phones,
      email,
      workingHours: workingHours || '09:00 - 18:00',
      mapLink: mapLink || '',
      social: req.body.social || {},
    };

    const branchImageFiles = (req.files || []).filter((f) => f.fieldname === 'images');
    if (branchImageFiles.length > 0) {
      branchData.images = branchImageFiles.map((file) => `/uploads/branches/${file.filename}`);
    }

    const branch = await Branch.create(branchData);

    const populatedBranch = await Branch.findById(branch._id).populate('company', 'name');

    res.status(201).json({
      success: true,
      data: populatedBranch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private
const updateBranch = async (req, res, next) => {
  try {
    let branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    const { company, name, address, email, workingHours, mapLink } = req.body;

    const updateData = {};
    if (company) updateData.company = company;
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (req.body.phones !== undefined) {
      try { updateData.phones = JSON.parse(req.body.phones); } catch { updateData.phones = []; }
    }
    if (email) updateData.email = email;
    if (workingHours) updateData.workingHours = workingHours;
    if (mapLink !== undefined) updateData.mapLink = mapLink;
    if (req.body.social) updateData.social = req.body.social;

    const branchImageFiles = (req.files || []).filter((f) => f.fieldname === 'images');
    if (branchImageFiles.length > 0) {
      updateData.images = branchImageFiles.map((file) => `/uploads/branches/${file.filename}`);
    }

    branch = await Branch.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('company', 'name');

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private
const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    await Branch.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
};
