const Admin = require('../models/Admin');

const checkPermission = (requiredPermission) => async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.permissions[requiredPermission]) {
            next();
        } else {
            return res.status(403).json({ 
                message: 'You do not have permission to perform this action' 
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkPermission }; 