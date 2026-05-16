const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create company
// @route   POST /api/companies
// @access  Private
const createCompany = async (req, res, next) => {
  try {
    const { name, description, website } = req.body;

    // Validate required fields
    if (!name || !name.az || !name.ru || !name.en) {
      return res.status(400).json({
        success: false,
        message: 'Company name in all languages (az, ru, en) is required',
      });
    }

    if (!description || !description.az || !description.ru || !description.en) {
      return res.status(400).json({
        success: false,
        message: 'Company description in all languages (az, ru, en) is required',
      });
    }

    const companyData = {
      name,
      description,
      website: website || '',
    };

    // Save uploaded file path to database
    if (req.file) {
      companyData.logo = `/uploads/companies/${req.file.filename}`;
      console.log(`[Company Create] File uploaded: ${companyData.logo}`);
    }

    console.log('[Company Create] Creating company with data:', companyData);
    const company = await Company.create(companyData);
    console.log('[Company Create] Company created successfully with ID:', company._id);

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('[Company Create] Error:', error);
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const { name, description, website } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (website !== undefined) updateData.website = website;

    // Save uploaded file path to database
    if (req.file) {
      updateData.logo = `/uploads/companies/${req.file.filename}`;
      console.log(`[Company Update] File uploaded: ${updateData.logo}`);
    }

    console.log('[Company Update] Updating company ID:', req.params.id, 'with data:', updateData);
    company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    console.log('[Company Update] Company updated successfully');

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('[Company Update] Error:', error);
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    await Company.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};
