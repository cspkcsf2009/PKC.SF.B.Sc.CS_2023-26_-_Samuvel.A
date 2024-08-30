import PropTypes from 'prop-types';

const MarkAllButtons = ({ selectedGroup, setSelectedGroup, handleMarkAllPresent, handleMarkAllAbsent }) => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
            onClick={handleMarkAllPresent}
            className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-lg transition-transform transform duration-300 ease-in-out hover:bg-green-600 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 active:bg-green-700 active:shadow-md text-sm uppercase"
            aria-label="Mark all as present"
            aria-live="polite"
        >
            Mark All Present
        </button>

        <div className="flex-1 mb-1 sm:mb-0">
            <label htmlFor="names" className="block text-sm sm:text-lg font-medium text-gray-700 mb-2 text-center">
                Select Names Category:
            </label>
            <select
                id="names"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="block w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white text-gray-900 text-sm sm:text-base"
            >
                <option value="All">All Names</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Folks">Folks</option>
            </select>
        </div>

        <button
            onClick={handleMarkAllAbsent}
            className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-lg transition-transform transform duration-300 ease-in-out hover:bg-red-600 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-300 active:bg-red-700 active:shadow-md text-sm uppercase"
            aria-label="Mark all as absent"
            aria-live="polite"
        >
            Mark All Absent
        </button>
    </div>
);

MarkAllButtons.propTypes = {
    selectedGroup: PropTypes.string.isRequired,
    setSelectedGroup: PropTypes.func.isRequired,
    handleMarkAllPresent: PropTypes.func.isRequired,
    handleMarkAllAbsent: PropTypes.func.isRequired,
};

export default MarkAllButtons;