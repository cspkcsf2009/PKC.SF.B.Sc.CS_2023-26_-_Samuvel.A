import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const ClassAndSubjectSelector = ({
    selectedClass,
    setSelectedClass,
    classes,
    selectedSubject,
    setSelectedSubject,
    subjects
}) => {
    const [manualSubject, setManualSubject] = useState('');

    const handleSubjectChange = (e) => {
        const value = e.target.value;
        setSelectedSubject(value);
        setManualSubject('');
    };

    const handleManualSubjectChange = (e) => {
        const value = e.target.value;
        setManualSubject(value);
        setSelectedSubject(value);
    };

    useEffect(() => {
        if (!subjects.includes(selectedSubject)) {
            setSelectedSubject(manualSubject);
        }
    }, [manualSubject, selectedSubject, setSelectedSubject, subjects]);

    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 w-full p-6 rounded-lg border-2 text-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full bg-white rounded-lg">
                        <div className="flex-1 mb-1 sm:mb-0">
                            <label htmlFor="class" className="block text-sm sm:text-lg font-medium text-gray-700 mb-2">
                                Select Class:
                            </label>
                            <select
                                id="class"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="block w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-900 text-sm sm:text-base"
                            >
                                {classes.map((cls) => (
                                    <option key={cls} value={cls} className="text-sm sm:text-base">
                                        {cls}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="subject" className="block text-sm sm:text-lg font-medium text-gray-700 mb-2">
                                Select Title:
                            </label>
                            <select
                                id="subject"
                                value={selectedSubject}
                                onChange={handleSubjectChange}
                                className="block w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-900 text-sm sm:text-base"
                            >
                                <option value="" className="text-sm sm:text-base">
                                    -- Select Title --
                                </option>
                                {subjects.map((subject) => (
                                    <option key={subject} value={subject} className="text-sm sm:text-base">
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="manualSubject" className="block text-sm sm:text-lg font-medium text-gray-700 mb-2">
                                Or Enter Title:
                            </label>
                            <input
                                id="manualSubject"
                                type="text"
                                value={manualSubject}
                                onChange={handleManualSubjectChange}
                                className="block w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-900 text-sm sm:text-base"
                                placeholder="Enter Title Manually"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ClassAndSubjectSelector.propTypes = {
    selectedClass: PropTypes.string.isRequired,
    setSelectedClass: PropTypes.func.isRequired,
    classes: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedSubject: PropTypes.string.isRequired,
    setSelectedSubject: PropTypes.func.isRequired,
    subjects: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ClassAndSubjectSelector;