const Lock = require('../models/Lock');
const mongoose = require('mongoose');
const { logActivity } = require('./activitylogServices');

const LOCK_DURATION = 30000; // 30 seconds

async function acquireLock(resource, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + LOCK_DURATION);

        // Clean up expired locks first
        await cleanupExpiredLocks();

        // Check for existing valid lock
        const existingLock = await Lock.findOne({
            resource,
            expiresAt: { $gt: now }
        }).session(session);

        if (existingLock) {
            if (existingLock.holder.toString() === userId.toString()) {
                existingLock.expiresAt = expiresAt;
                await existingLock.save({ session });
                await session.commitTransaction();
                return { locked: false, lockId: existingLock._id };
            }

            const remainingTime = Math.ceil((existingLock.expiresAt - now) / 1000);
            await session.commitTransaction();
            return {
                locked: true,
                remainingTime,
                holder: existingLock.holder,
                message: `Resource is locked by another user. Please try again in ${remainingTime} seconds.`
            };
        }

        const newLock = new Lock({
            resource,
            holder: userId,
            expiresAt
        });

        await newLock.save({ session });
        await session.commitTransaction();
        
        return { locked: false, lockId: newLock._id };
    } catch (error) {
        await session.abortTransaction();
        console.error('Lock acquisition error:', error);
        throw error;
    } finally {
        session.endSession();
    }
}

async function releaseLock(resource, userId) {
    try {
        // First, clean up any expired locks
        await cleanupExpiredLocks();

        // Then release the specific lock
        const result = await Lock.findOneAndDelete({
            resource,
            holder: userId
        });

        // If no lock was found, check if there's an expired lock for this resource/user
        if (!result) {
            await Lock.deleteMany({
                resource,
                holder: userId,
                expiresAt: { $lt: new Date() }
            });
        }

        return true;
    } catch (error) {
        console.error('Error releasing lock:', error);
        return false;
    }
}

async function checkLock(resource) {
    try {
        const lock = await Lock.findOne({ resource }).populate('holder', 'fullname');
        if (!lock) return { locked: false };

        const now = new Date();
        if (lock.expiresAt > now) {
            return {
                locked: true,
                currentEditor: lock.holder.fullname || 'Another admin',
                remainingTime: lock.expiresAt - now
            };
        }

        await Lock.deleteOne({ _id: lock._id });
        return { locked: false };
    } catch (error) {
        console.error('Error checking lock:', error);
        return { locked: false };
    }
}

async function cleanupExpiredLocks() {
    try {
        const now = new Date();
        await Lock.deleteMany({ expiresAt: { $lt: now } });
    } catch (error) {
        console.error('Error cleaning up locks:', error);
    }
}

module.exports = {
    acquireLock,
    releaseLock,
    checkLock
}; 