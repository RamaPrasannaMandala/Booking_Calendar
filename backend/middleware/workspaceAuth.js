const Workspace = require('../models/Workspace');

const workspaceAuth = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is the owner
    if (workspace.ownerId.toString() === req.user._id.toString()) {
      req.workspaceRole = 'owner';
      req.workspace = workspace;
      return next();
    }

    // Check if user is a member
    const member = workspace.members.find(m => m.userId.toString() === req.user._id.toString());
    
    if (!member) {
      return res.status(403).json({ error: 'Access denied to workspace' });
    }

    req.workspaceRole = member.role;
    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Workspace authentication failed' });
  }
};

module.exports = workspaceAuth;

