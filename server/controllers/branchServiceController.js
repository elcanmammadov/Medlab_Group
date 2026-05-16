const path = require('path');
const BranchService = require('../models/BranchService');

// @desc Get services by branch
// @route GET /api/branch-services/branch/:branchId
// @access Public
const getServicesByBranch = async (req, res, next) => {
  try {
    const branchId = req.params.branchId;
    const services = await BranchService.find({ branch: branchId })
      .sort({ createdAt: -1 })
      .populate('branch', 'name');
    console.log(
      '[BranchService Get] Branch:',
      branchId,
      'Services count:',
      services.length,
      'Data:',
      JSON.stringify(services, null, 2),
    );
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc Get all services
// @route GET /api/branch-services
// @access Public
const getAllServices = async (req, res, next) => {
  try {
    const { company, branch } = req.query;
    const filter = {};

    if (branch) {
      filter.branch = branch;
    } else if (company) {
      const Branch = require('../models/Branch');
      const branches = await Branch.find({ company }).select('_id');
      filter.branch = { $in: branches.map((b) => b._id) };
    }

    const services = await BranchService.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: 'branch', select: 'name company', populate: { path: 'company', select: 'name' } });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc Get single service
// @route GET /api/branch-services/:id
// @access Public
const getService = async (req, res, next) => {
  try {
    const service = await BranchService.findById(req.params.id)
      .populate({ path: 'branch', select: 'name company', populate: { path: 'company', select: 'name' } });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc Create service
// @route POST /api/branch-services
// @access Private
const createService = async (req, res, next) => {
  try {
    const { branch, name } = req.body;
    if (!branch) return res.status(400).json({ success: false, message: 'Branch is required' });
    if (!name || !name.az || !name.ru || !name.en)
      return res
        .status(400)
        .json({ success: false, message: 'Service name in all languages is required' });

    const serviceData = { branch, name };
    if (req.file) {
      // Extract path relative to server directory and convert to forward slashes
      const uploadsDir = path.join(__dirname, '../uploads');
      let relativePath = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
      // Ensure it starts with /uploads/
      if (!relativePath.startsWith('/uploads')) {
        relativePath = '/uploads/' + relativePath;
      }
      serviceData.image = relativePath;
      console.log(
        '[BranchService Create] File:',
        req.file.filename,
        'Full path:',
        req.file.path,
        'Uploads dir:',
        uploadsDir,
        'Stored:',
        serviceData.image,
      );
    }

    const service = await BranchService.create(serviceData);
    console.log('[BranchService Create] Service created:', service);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc Update service
// @route PUT /api/branch-services/:id
// @access Private
const updateService = async (req, res, next) => {
  try {
    let service = await BranchService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const { name, branch } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (branch) updateData.branch = branch;
    if (req.file) {
      const uploadsDir = path.join(__dirname, '../uploads');
      let relativePath = path.relative(uploadsDir, req.file.path).replace(/\\/g, '/');
      // Ensure it starts with /uploads/
      if (!relativePath.startsWith('/uploads')) {
        relativePath = '/uploads/' + relativePath;
      }
      updateData.image = relativePath;
      console.log(
        '[BranchService Update] File:',
        req.file.filename,
        'Full path:',
        req.file.path,
        'Stored:',
        updateData.image,
      );
    }

    service = await BranchService.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log('[BranchService Update] Service updated:', service);

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc Delete service
// @route DELETE /api/branch-services/:id
// @access Private
const deleteService = async (req, res, next) => {
  try {
    const service = await BranchService.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    await BranchService.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServicesByBranch,
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
};
