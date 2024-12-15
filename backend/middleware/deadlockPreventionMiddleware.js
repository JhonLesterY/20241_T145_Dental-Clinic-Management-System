const Lock = require('../models/Lock');

const deadlockPreventionMiddleware = async (req, res, next) => {
    const userId = req.user?._id;
    if (!userId) return next();

    try {
        // Check if user is holding multiple locks
        const userLocks = await Lock.find({ holder: userId });
        
        if (userLocks.length > 3) {
            // Force release oldest lock if too many are held
            const oldestLock = userLocks.sort((a, b) => a.createdAt - b.createdAt)[0];
            await Lock.findByIdAndDelete(oldestLock._id);
            
            console.warn(`Force released lock for resource ${oldestLock.resource} to prevent deadlock`);
        }
        
        next();
    } catch (error) {
        console.error('Deadlock prevention error:', error);
        next(error);
    }
};

module.exports = deadlockPreventionMiddleware; 