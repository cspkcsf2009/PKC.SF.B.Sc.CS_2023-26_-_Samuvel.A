import PropTypes from 'prop-types';

const SummarySection = ({ result, showPresent, setShowPresent, showAbsent, setShowAbsent }) => (
    <div className=" sm:mt-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:space-x-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg shadow-sm w-full sm:w-1/2">
                <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-4">
                    Total Present Students: {result.present.length}
                </h3>
                {showPresent && result.present.length > 0 && (
                    <div>
                        <ol className="list-decimal pl-5 text-gray-800">
                            {result.present.map((student) => (
                                <li key={student.index} className="mb-1">{student.name}</li>
                            ))}
                        </ol>
                    </div>
                )}
                <button
                    onClick={() => setShowPresent(!showPresent)}
                    className={`mt-4 w-full px-4 py-2 ${showPresent ? 'bg-blue-400' : 'bg-blue-500'} text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300`}
                >
                    {showPresent ? 'Hide Present List' : 'View Present List'}
                </button>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 sm:p-6 rounded-lg shadow-sm w-full sm:w-1/2">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-4">
                    Total Absent Students: {result.absent.length}
                </h3>
                {showAbsent && result.absent.length > 0 && (
                    <div>
                        <ol className="list-decimal pl-5 text-gray-800">
                            {result.absent.map((student) => (
                                <li key={student.index} className="mb-1">{student.name}</li>
                            ))}
                        </ol>
                    </div>
                )}
                <button
                    onClick={() => setShowAbsent(!showAbsent)}
                    className={`mt-4 w-full px-4 py-2 ${showAbsent ? 'bg-red-400' : 'bg-red-500'} text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors duration-300`}
                >
                    {showAbsent ? 'Hide Absent List' : 'View Absent List'}
                </button>
            </div>
        </div>
    </div>
);

// Add prop types validation
SummarySection.propTypes = {
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
    showPresent: PropTypes.bool.isRequired,
    setShowPresent: PropTypes.func.isRequired,
    showAbsent: PropTypes.bool.isRequired,
    setShowAbsent: PropTypes.func.isRequired,
};

export default SummarySection;