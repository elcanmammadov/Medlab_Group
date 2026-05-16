const Leadership = require('../models/Leadership');

// @desc    Get all leadership members
// @route   GET /api/leadership
// @access  Public
const getLeadership = async (req, res, next) => {
  try {
    const filter = {};
    const { type, companyId } = req.query;

    if (type === 'global') {
      filter.type = 'global';
    } else if (type === 'company' && companyId) {
      filter.type = 'company';
      filter.companyId = companyId;
    } else if (req.params.companyId) {
      filter.companyId = req.params.companyId;
    }

    const leaders = await Leadership.find(filter)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaders.length, data: leaders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global leadership members (no company)
// @route   GET /api/leadership/global
// @access  Public
const getGlobalLeaders = async (req, res, next) => {
  try {
    const leaders = await Leadership.find({ type: 'global' }).sort({ createdAt: -1 });
    console.log('[GlobalLeaders] count:', leaders.length, leaders.map(l => ({ name: l.name, type: l.type, companyId: l.companyId })));
    res.status(200).json({ success: true, count: leaders.length, data: leaders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company-specific leadership members
// @route   GET /api/leadership/company/:companyId
// @access  Public
const getCompanyLeaders = async (req, res, next) => {
  try {
    const leaders = await Leadership.find({
      type: 'company',
      companyId: req.params.companyId,
    })
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: leaders.length, data: leaders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single leadership member
// @route   GET /api/leadership/:id
// @access  Public
const getLeader = async (req, res, next) => {
  try {
    const leader = await Leadership.findById(req.params.id).populate('companyId', 'name');
    if (!leader) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    res.status(200).json({ success: true, data: leader });
  } catch (error) {
    next(error);
  }
};

// @desc    Create leadership member
// @route   POST /api/leadership
// @access  Private
const createLeader = async (req, res, next) => {
  try {
    console.log('[CreateLeader] req.body:', JSON.stringify(req.body));
    const { name, surname, position, bio } = req.body;
    let { companyId, type } = req.body;

    if (req.params.companyId) {
      companyId = req.params.companyId;
      type = 'company';
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Leader name is required' });
    }

    if (!position || !position.az) {
      return res.status(400).json({
        success: false,
        message: 'Leader position (az) is required',
      });
    }

    const leaderType = type || 'global';

    if (leaderType === 'company' && !companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required for company-level leaders',
      });
    }

    const leaderData = {
      name,
      surname: surname || '',
      position: position || {},
      bio: bio || {},
      type: leaderType,
      companyId: leaderType === 'company' ? companyId : null,
    };

    if (req.file) {
      leaderData.photo = `/uploads/leadership/${req.file.filename}`;
    }

    const leader = await Leadership.create(leaderData);
    res.status(201).json({ success: true, data: leader });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leadership member
// @route   PUT /api/leadership/:id
// @access  Private
const updateLeader = async (req, res, next) => {
  try {
    let leader = await Leadership.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }

    const { name, surname, position, bio, type, companyId } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (surname !== undefined) updateData.surname = surname;
    if (position) updateData.position = position;
    if (bio) updateData.bio = bio;

    if (type) {
      updateData.type = type;
      updateData.companyId = type === 'company' ? (companyId || null) : null;
    } else if (companyId !== undefined) {
      updateData.companyId = companyId || null;
    }

    if (req.file) {
      updateData.photo = `/uploads/leadership/${req.file.filename}`;
    }

    leader = await Leadership.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('companyId', 'name');

    res.status(200).json({ success: true, data: leader });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete leadership member
// @route   DELETE /api/leadership/:id
// @access  Private
const deleteLeader = async (req, res, next) => {
  try {
    const leader = await Leadership.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({ success: false, message: 'Leader not found' });
    }
    await Leadership.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Leader deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeadership,
  getGlobalLeaders,
  getCompanyLeaders,
  getLeader,
  createLeader,
  updateLeader,
  deleteLeader,
};
