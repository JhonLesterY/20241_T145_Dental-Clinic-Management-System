const checkAdminLevel = (requiredLevel) => async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin || admin.permissionLevel !== requiredLevel) {
            return res.status(403).json({ 
                message: `This action requires ${requiredLevel} admin privileges` 
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkAdminLevel };
