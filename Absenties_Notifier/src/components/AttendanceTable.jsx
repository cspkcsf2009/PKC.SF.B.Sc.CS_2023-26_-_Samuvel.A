import { useMemo } from 'react';
import PropTypes from 'prop-types';

const AttendanceTable = ({ allNames, attendance, handleStatusChange }) => {
    // AttendanceRow function within AttendanceTable
    const AttendanceRow = ({ index, name, status }) => (
        <tr
            className={`transition-colors duration-300 ease-in-out hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
        >
            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 font-medium text-center">{index + 1}</td>
            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900 font-medium text-center">{name}</td>
            <td className="px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-900">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <label className="flex items-center justify-center space-x-2 w-full sm:w-auto">
                        <input
                            type="radio"
                            name={name}
                            value="Present"
                            checked={status === 'Present'}
                            onChange={() => handleStatusChange(name, 'Present')}
                            className="form-radio text-blue-500 ring-blue-400 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">Present</span>
                    </label>
                    <label className="flex items-center justify-center space-x-2 w-full sm:w-auto">
                        <input
                            type="radio"
                            name={name}
                            value="Absent"
                            checked={status === 'Absent'}
                            onChange={() => handleStatusChange(name, 'Absent')}
                            className="form-radio text-red-500 ring-red-400 focus:ring-2"
                        />
                        <span className="text-gray-700 font-medium">Absent</span>
                    </label>
                </div>
            </td>
        </tr>
    );

    // Prop types for AttendanceRow
    AttendanceRow.propTypes = {
        index: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        handleStatusChange: PropTypes.func.isRequired,
    };

    // Memoize AttendanceRow rendering
    const memoizedAttendanceRows = useMemo(() => (
        allNames.map((name, index) => (
            <AttendanceRow
                key={name}
                index={index}
                name={name}
                status={attendance[name] || 'Absent'} // Default to 'Absent' if status is undefined
                handleStatusChange={handleStatusChange}
            />
        ))
    ), [allNames, attendance, handleStatusChange]);

    return (
        <table className="w-full divide-y divide-gray-300 mb-6 bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-200 text-gray-700">
                <tr>
                    <th className="px-2 py-1 sm:px-4 sm:py-2 text-center text-base sm:text-lg font-medium">No.</th>
                    <th className="px-2 py-1 sm:px-4 sm:py-2 text-center text-base sm:text-lg font-medium">Name</th>
                    <th className="px-2 py-1 sm:px-4 sm:py-2 text-center text-base sm:text-lg font-medium">Attendance</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {memoizedAttendanceRows}
            </tbody>
        </table>
    );
};

AttendanceTable.propTypes = {
    allNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    attendance: PropTypes.objectOf(PropTypes.string).isRequired,
    handleStatusChange: PropTypes.func.isRequired,
};

export default AttendanceTable;