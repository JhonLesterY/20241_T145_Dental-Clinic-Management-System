const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');

class ReportService {
    async generateAppointmentReport(startDate, endDate) {
        try {
            console.log('Generating report for period:', { startDate, endDate });
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            console.log('Querying appointments between:', start, 'and', end);

            const appointments = await Appointment.find({
                appointmentDate: {
                    $gte: start,
                    $lte: end
                }
            });

            console.log('Found appointments:', appointments.length);

            const totalAppointments = appointments.length;
            const completedAppointments = appointments.filter(app => app.status === 'confirmed').length;
            const cancelledAppointments = appointments.filter(app => app.status === 'declined').length;
            const pendingAppointments = appointments.filter(app => app.status === 'pending').length;

            return {
                period: {
                    start: start,
                    end: end
                },
                summary: {
                    totalAppointments,
                    completedAppointments,
                    cancelledAppointments,
                    pendingAppointments,
                    completionRate: totalAppointments ? 
                        `${((completedAppointments / totalAppointments) * 100).toFixed(2)}%` : 
                        '0%'
                },
                appointments: appointments.map(app => ({
                    id: app.appointmentId,
                    date: app.appointmentDate,
                    time: app.appointmentTime,
                    patientName: app.patientName,
                    status: app.status,
                    requirementsStatus: app.requirementsStatus
                }))
            };
        } catch (error) {
            console.error('Error in generateAppointmentReport:', error);
            throw error;
        }
    }
}

module.exports = new ReportService(); 