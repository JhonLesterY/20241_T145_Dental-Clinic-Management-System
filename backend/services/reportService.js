const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Inventory = require('../models/Inventory');
const Feedback = require('../models/Feedback');

class ReportService {
    async generateCompleteReport(period, year, month) {
        try {
            // Parse inputs as numbers
            const numericYear = parseInt(year);
            const numericMonth = parseInt(month);

            // Validate inputs
            if (isNaN(numericYear) || numericYear < 1900 || numericYear > 2100) {
                throw new Error('Invalid year provided');
            }

            let startDate, endDate;
            
            if (period === 'monthly') {
                if (isNaN(numericMonth) || numericMonth < 1 || numericMonth > 12) {
                    throw new Error('Invalid month provided');
                }
                // Create dates using UTC to avoid timezone issues
                startDate = new Date(Date.UTC(numericYear, numericMonth - 1, 1));
                endDate = new Date(Date.UTC(numericYear, numericMonth, 0)); // Last day of the month
            } else {
                startDate = new Date(Date.UTC(numericYear, 0, 1));
                endDate = new Date(Date.UTC(numericYear, 11, 31, 23, 59, 59, 999));
            }

            // Validate created dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date range generated');
            }

            const [appointmentStats, patientStats, inventoryStats, feedbackStats] = 
                await Promise.all([
                    this.getAppointmentStats(startDate, endDate),
                    this.getPatientStats(startDate, endDate),
                    this.getInventoryStats(startDate, endDate),
                    this.getFeedbackStats(startDate, endDate)
                ]);

            return {
                period: { 
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString() 
                },
                summary: {
                    totalAppointments: appointmentStats.totalAppointments,
                    completedAppointments: appointmentStats.completedAppointments,
                    pendingAppointments: appointmentStats.pendingAppointments,
                    cancelledAppointments: appointmentStats.cancelledAppointments,
                    completionRate: appointmentStats.totalAppointments ? 
                        `${((appointmentStats.completedAppointments / appointmentStats.totalAppointments) * 100).toFixed(1)}%` : 
                        '0%'
                },
                appointments: await this.getAppointmentDetails(startDate, endDate),
                patientStats,
                inventoryStats,
                feedbackStats
            };
        } catch (error) {
            console.error('Error generating complete report:', error);
            throw new Error(`Failed to generate complete report: ${error.message}`);
        }
    }

    async getAppointmentDetails(startDate, endDate) {
        try {
            const appointments = await Appointment.find({
                appointmentDate: { $gte: startDate, $lte: endDate }
            })
            .populate({
                path: 'patientId',
                select: 'name email'
            })
            .populate({
                path: 'dentistId',
                select: 'fullname'
            })
            .lean();

            console.log('Raw appointments:', appointments); // Debug log

            return appointments.map(apt => ({
                date: apt.appointmentDate || new Date(),
                // Use stored name if population fails
                patientName: apt.patientId?.name || apt.patientName || 'N/A',
                // Use stored name if population fails
                dentistName: apt.dentistId?.fullname || apt.dentistName || 'N/A',
                status: apt.status || 'N/A'
            }));
        } catch (error) {
            console.error('Error in getAppointmentDetails:', error);
            throw error;
        }
    }

    async getAppointmentStats(startDate, endDate) {
        const appointments = await Appointment.find({
            appointmentDate: { $gte: startDate, $lte: endDate }
        });

        const totalAppointments = appointments.length;
        const completedAppointments = appointments.filter(app => app.status === 'completed').length;
        const pendingAppointments = appointments.filter(app => app.status === 'pending').length;
        const cancelledAppointments = appointments.filter(app => app.status === 'cancelled').length;

        return {
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            cancelledAppointments
        };
    }

    async getPatientStats(startDate, endDate) {
        const totalPatients = await Patient.countDocuments();
        const newPatients = await Patient.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        return {
            totalPatients,
            newPatients,
            patientGrowthRate: totalPatients ? ((newPatients / totalPatients) * 100).toFixed(2) + '%' : '0%'
        };
    }

    async getInventoryStats(startDate, endDate) {
        const inventory = await Inventory.find();
        const lowStock = inventory.filter(item => item.quantity <= item.minimumRequired);

        return {
            totalItems: inventory.length,
            lowStockItems: lowStock.length,
            lowStockList: lowStock.map(item => ({
                name: item.itemName,
                currentQuantity: item.quantity,
                minimumRequired: item.minimumRequired
            })),
            totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        };
    }

    async getFeedbackStats(startDate, endDate) {
        const feedbacks = await Feedback.find({
            submittedAt: { $gte: startDate, $lte: endDate }
        });

        const totalResponses = feedbacks.length;
        const satisfiedCount = feedbacks.filter(f => 
            f.answers['Treatment Satisfaction'] === 'Very Satisfied' || 
            f.answers['Treatment Satisfaction'] === 'Satisfied'
        ).length;

        return {
            totalResponses,
            satisfactionRate: totalResponses ? 
                ((satisfiedCount / totalResponses) * 100).toFixed(2) + '%' : '0%',
            averageRating: this.calculateAverageRating(feedbacks)
        };
    }

    calculateAverageRating(feedbacks) {
        if (!feedbacks || feedbacks.length === 0) return 0;
        
        let totalRating = 0;
        let ratingCount = 0;

        feedbacks.forEach(feedback => {
            // Assuming 'Overall Experience' is rated on a scale of 1-4
            const rating = {
                'Excellent': 4,
                'Good': 3,
                'Fair': 2,
                'Poor': 1
            }[feedback.answers['Overall Experience']];

            if (rating) {
                totalRating += rating;
                ratingCount++;
            }
        });

        return ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 0;
    }
}

module.exports = new ReportService(); 