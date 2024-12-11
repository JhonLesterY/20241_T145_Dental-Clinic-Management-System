import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

//Properly initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;

export const generatePDF = (report) => {
  if (!report || !report.appointments) {
    throw new Error('Invalid report data');
  }

  const docDefinition = {
    content: [
      { text: 'Dental Clinic Report', style: 'header' },
      { text: `Generated on: ${new Date().toLocaleDateString()}`, style: 'subheader' },
      
      // Appointment Statistics
      { text: 'Appointment Statistics', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        ul: [
          `Total Appointments: ${report.summary?.totalAppointments || 0}`,
          `Completed Appointments: ${report.summary?.completedAppointments || 0}`,
          `Pending Appointments: ${report.summary?.pendingAppointments || 0}`,
          `Cancelled Appointments: ${report.summary?.cancelledAppointments || 0}`,
          `Completion Rate: ${report.summary?.completionRate || '0%'}`
        ]
      },

      // Appointments Table
      { text: 'Appointment Details', style: 'sectionHeader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto'],
          body: [
            ['Date', 'Patient', 'Dentist', 'Status'],
            ...report.appointments.map(appointment => [
              new Date(appointment.date).toLocaleDateString() || 'N/A',
              appointment.patientName || 'N/A',
              appointment.dentistName || 'N/A',
              appointment.status || 'N/A'
            ])
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      subheader: {
        fontSize: 14,
        margin: [0, 0, 0, 20]
      },
      sectionHeader: {
        fontSize: 16,
        bold: true,
        color: '#003367'
      }
    },
    defaultStyle: {
      fontSize: 12
    }
  };

  return pdfMake.createPdf(docDefinition);
}; 