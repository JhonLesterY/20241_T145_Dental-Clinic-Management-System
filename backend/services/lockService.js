class LockService {
    constructor() {
        this.locks = new Map();
        this.LOCK_DURATION = 30000; // 30 seconds
    }

    acquireLock(resource) {
        const now = Date.now();
        const existingLock = this.locks.get(resource);
        
        // Check if lock exists and hasn't expired
        if (existingLock && now < existingLock) {
            return {
                locked: true,
                remainingTime: Math.ceil((existingLock - now) / 1000)
            };
        }

        // Set new lock
        this.locks.set(resource, now + this.LOCK_DURATION);
        return {
            locked: false,
            remainingTime: 0
        };
    }

    releaseLock(resource) {
        this.locks.delete(resource);
    }
}

module.exports = new LockService(); 