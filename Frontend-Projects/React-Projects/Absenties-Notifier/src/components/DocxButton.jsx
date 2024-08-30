import { useState } from 'react';
import PropTypes from 'prop-types';
import { generateDocx } from './generateDocx'; // Ensure this path is correct
import { saveAs } from 'file-saver';

const DocxButton = ({ result, selectedClass, selectedSubject }) => {
    // State for loading status and error handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to format dates
    const formatDate = (dateString) => {
        const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, dateOptions).replace(/\//g, '-');
    };

    // Set a default date, e.g., current date
    const date = formatDate(new Date().toISOString());

    // Handle the download action
    const handleDownload = async () => {
        setLoading(true);
        setError(null);

        try {
            const presentCount = result.present.length;
            const absentCount = result.absent.length;
            const counts = { presentCount, absentCount };

            const allStudents = [...result.present, ...result.absent];

            // Generate the document
            const blob = await generateDocx(allStudents, selectedClass, selectedSubject, date, counts);
            const fileName = `${selectedSubject} [${date}].docx`;
            // Save the document using file-saver
            saveAs(blob, fileName);
        } catch (err) {
            setError('Failed to generate document. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mb-6 text-center">
            <button
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Download as a Word Document'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
};

DocxButton.propTypes = {
    result: PropTypes.shape({
        present: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                index: PropTypes.number.isRequired,
                rollNo: PropTypes.string.isRequired,
                attendanceStatus: PropTypes.string.isRequired,
            })
        ).isRequired,
        absent: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                index: PropTypes.number.isRequired,
                rollNo: PropTypes.string.isRequired,
                attendanceStatus: PropTypes.string.isRequired,
            })
        ).isRequired,
    }).isRequired,
    selectedClass: PropTypes.string.isRequired,
    selectedSubject: PropTypes.string.isRequired,
};

export default DocxButton;