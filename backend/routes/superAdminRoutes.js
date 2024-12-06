const express = require('express');
const router = express.Router();
const superAdminService = require('../services/superAdminServices');
const { authenticateSuperAdmin } = require('../middleware/authMiddleware');

router.put('/permissions/:roleType', authenticateSuperAdmin, async (req, res) => {
    try {
        const result = await superAdminService.updateRolePermissions(
            req.params.roleType,
            req.body.permissions
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/permissions/:roleType', authenticateSuperAdmin, async (req, res) => {
    try {
        const permissions = await superAdminService.getAvailablePermissions(req.params.roleType);
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 