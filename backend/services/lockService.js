const Lock = require('../models/Lock');
const mongoose = require('mongoose');
const { logActivity } = require('./activitylogServices');

class LockService {
    constructor() {
        this.LOCK_DURATION = 30000; // 30 seconds
    }

    async acquireLock(resource, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + this.LOCK_DURATION);

            // Clean up expired locks
            await this.cleanupExpiredLocks();

            // For delete operations, check for ANY existing delete lock
            if (resource.startsWith('delete-')) {
                const existingDeleteLock = await Lock.findOne({
                    resource: { $regex: '^delete-' },
                    expiresAt: { $gt: now }
                }).session(session);

                if (existingDeleteLock) {
                    const remainingTime = Math.ceil((existingDeleteLock.expiresAt - now) / 1000);
                    await session.commitTransaction();
                    return {
                        locked: true,
                        remainingTime,
                        holder: existingDeleteLock.holder,
                        message: `Another administrator is currently performing a delete operation. Please try again in ${remainingTime} seconds.`
                    };
                }
            }

            // Create new lock with global delete resource
            const lockResource = resource.startsWith('delete-') ? 'delete-global' : resource;
            const newLock = new Lock({
                resource: lockResource,
                holder: userId,
                expiresAt
            });

            await newLock.save({ session });
            await session.commitTransaction();
            
            return {
                locked: false,
                remainingTime: 0,
                lockId: newLock._id
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Lock acquisition error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async releaseLock(resource, userId) {
        try {
            const result = await Lock.findOneAndDelete({
                resource,
                holder: userId
            });

            if (result) {
                console.log(`Lock released for resource: ${resource} by user: ${userId}`);
                await logActivity(userId, 'system', 'LOCK_RELEASED', {
                    resource
                });
                return true;
            } else {
                console.warn(`No lock found for resource: ${resource} by user: ${userId}`);
                return false;
            }
        } catch (error) {
            console.error('Error releasing lock:', error);
            return false; // Return false instead of throwing
        }
    }

    async cleanupExpiredLocks() {
        try {
            const now = new Date();
            const result = await Lock.deleteMany({
                expiresAt: { $lt: now }
            });
            
            if (result.deletedCount > 0) {
                console.log(`Cleaned up ${result.deletedCount} expired locks`);
            }
        } catch (error) {
            console.error('Error cleaning up locks:', error);
        }
    }
}

// Create cleanup interval
const lockService = new LockService();
setInterval(() => lockService.cleanupExpiredLocks(), 60000); // Run every minute

module.exports = lockService; 