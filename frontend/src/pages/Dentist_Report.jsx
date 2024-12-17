import React, { useState, useEffect } from "react";
import axios from 'axios';
import Logo from "/src/images/Dental_logo.png";
import DentistSideBar from "../components/DentistSidebar";
import { useDentistTheme } from '../context/DentistThemeContext';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dentist_Report = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useDentistTheme();
  const { accessToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    const fetchDentistReports = async () => {
      try {
        const dentistId = sessionStorage.getItem('dentist_id');
        const token = sessionStorage.getItem('token');

        if (!dentistId || !token) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`http://localhost:5000/dentists/${dentistId}/generate-report`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setReports(response.data.reports.map(report => ({
          ...report,
          age: report.age || '',
          courseAndYear: report.courseAndYear || ''
        })));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dentist reports:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDentistReports();
  }, []);

  const downloadPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Get dentist name from session storage
    const dentistName = sessionStorage.getItem('name') || 'Unknown Dentist';
    
    // Add header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Dental Clinic Consultation Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    // Clinic details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('University Dental Clinic', doc.internal.pageSize.width / 2, 22, { align: 'center' });
    doc.text('Providing Quality Dental Services', doc.internal.pageSize.width / 2, 28, { align: 'center' });
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, 35, doc.internal.pageSize.width - 20, 35);
    
    // Prepare table data
    const tableColumn = [
      'Date', 
      'Tooth Number', 
      'Patient Name', 
      'Age', 
      'Course/Year', 
      'Treatment', 
      'Medicine', 
      'Quantity'
    ];
    
    const tableRows = reports.map(report => [
      new Date(report.date).toLocaleDateString(),
      report.toothNumber,
      report.patientName,
      report.age || 'N/A',
      report.courseAndYear || 'N/A',
      report.treatment,
      report.medicine,
      report.quantity
    ]);

    // Add the table using jspdf-autotable
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 }
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Page number
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 
        doc.internal.pageSize.width - 30, 
        doc.internal.pageSize.height - 15
      );
      
      // Prepared by
      doc.text(`Prepared by: Dr. ${dentistName}`, 
        20, 
        doc.internal.pageSize.height - 15
      );
      
      // Date prepared
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 
        doc.internal.pageSize.width / 2 - 20, 
        doc.internal.pageSize.height - 15
      );
    }

    // Save the PDF
    doc.save(`Dental_Consultation_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleUpdateReport = async (reportId, updates) => {
    try {
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');

      // Update backend
      await axios.put(`http://localhost:5000/consultations/${reportId}`, updates, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.consultationId === reportId 
            ? { ...report, ...updates } 
            : report
        )
      );

      // Clear editing state
      setEditingReport(null);
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report. Please try again.');
    }
  };

  const renderEditableField = (report, field) => {
    const isEditing = editingReport === report.consultationId;
    
    return isEditing ? (
      <input
        type={field === 'age' ? 'number' : 'text'}
        value={report[field]}
        onChange={(e) => {
          const updatedReports = reports.map(r => 
            r.consultationId === report.consultationId 
              ? { ...r, [field]: e.target.value } 
              : r
          );
          setReports(updatedReports);
        }}
        className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
      />
    ) : (
      <span>{report[field] || 'Not specified'}</span>
    );
  };

  if (loading) {
    return (
      <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} justify-center items-center`}>
        <div className="text-xl">Loading reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} justify-center items-center`}>
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className={`${isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Dentist Reports</h1>
            </div>
          </div>
        </header>

        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Consultation Reports</h3>
          
          <div className={`overflow-x-auto rounded-lg shadow-md p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full table-auto">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Consultation ID</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Date</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Tooth Number</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Patient Name</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Age</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Course & Year</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Treatment</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Medicine</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Quantity</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Signature</th>
                  <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={report.consultationId || index} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.consultationId}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(report.date).toLocaleDateString()}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.toothNumber}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.patientName}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {editingReport === report.consultationId ? (
                        <input
                          type="number"
                          value={report.age}
                          onChange={(e) => {
                            const updatedReports = reports.map(r => 
                              r.consultationId === report.consultationId 
                                ? { ...r, age: e.target.value } 
                                : r
                            );
                            setReports(updatedReports);
                          }}
                          className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                      ) : (
                        report.age || 'Not specified'
                      )}
                    </td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {editingReport === report.consultationId ? (
                        <input
                          type="text"
                          value={report.courseAndYear}
                          onChange={(e) => {
                            const updatedReports = reports.map(r => 
                              r.consultationId === report.consultationId 
                                ? { ...r, courseAndYear: e.target.value } 
                                : r
                            );
                            setReports(updatedReports);
                          }}
                          className={`w-full px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                      ) : (
                        report.courseAndYear || 'Not specified'
                      )}
                    </td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.treatment}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.medicine}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.quantity}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{report.signature}</td>
                    <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {editingReport === report.consultationId ? (
                        <>
                          <button 
                            onClick={() => handleUpdateReport(report.consultationId, { 
                              age: report.age, 
                              courseAndYear: report.courseAndYear 
                            })}
                            className={`mr-2 px-2 py-1 rounded ${isDarkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white'}`}
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingReport(null)}
                            className={`px-2 py-1 rounded ${isDarkMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white'}`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setEditingReport(report.consultationId)}
                          className={`px-2 py-1 rounded ${isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'}`}
                        >
                          Edit
                        </button>
                      )}
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
                 {/* Add PDF Download Button */}
      {reports.length > 0 && (
        <div className="flex justify-end p-4">
          <button 
            onClick={downloadPDF}
            className={`px-4 py-2 rounded ${
              isDarkMode 
                ? 'bg-blue-700 text-white hover:bg-blue-600' 
                : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            Download PDF
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Dentist_Report;