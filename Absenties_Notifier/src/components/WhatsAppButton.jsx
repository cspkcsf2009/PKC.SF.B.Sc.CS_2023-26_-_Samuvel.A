// WhatsAppButton.js
import PropTypes from 'prop-types';
import WhatsAppIcon from '../assets/Digital_Glyph_Green.svg';
import { useState, useCallback } from 'react';

const WhatsAppButton = ({ isSubmitClicked, result, selectedClass, selectedSubject, isManualSubject }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const getFormattedDateTime = () => {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const date = new Date();
        return `${date.toLocaleDateString(undefined, dateOptions)} at ${date.toLocaleTimeString(undefined, timeOptions)}`;
    };

    const handleSendWhatsApp = useCallback(() => {
        try {
            const { present, absent } = result;
            let message = '';

            if (isManualSubject) {
                message = `*--- ${selectedSubject} Report ---*\n\n` +
                    `*Date and Time:* ${getFormattedDateTime()}\n\n` +
                    `*Class:* ${selectedClass}\n\n` +
                    `*${selectedSubject} List (${absent.length})*:\n` +
                    `${absent.length > 0 ? absent.map((item, index) => `${index + 1}. ${item.name}`).join('\n') : 'No students absent.'}`;
            } else {
                message = `*--- Attendance Report ---*\n\n` +
                    `*Date and Time:* ${getFormattedDateTime()}\n\n` +
                    `*Class:* ${selectedClass}\n\n` +
                    `*Title:* ${selectedSubject}\n\n` +
                    `*Summary:*\n` +
                    `- Total Present: ${present.length}\n` +
                    `- Total Absent: ${absent.length}\n\n` +
                    `*--- Absentees List (${absent.length}) ---*\n` +
                    `${absent.length > 0 ? absent.map((item, index) => `${index + 1}. ${item.name}`).join('\n') : 'No students absent.'}`;
            }

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
            console.log('Attendance report sent to WhatsApp.');
        } catch (error) {
            console.error('Failed to send attendance report:', error);
            alert('Failed to send the attendance report. Please try again.');
        }
    }, [result, selectedClass, selectedSubject, isManualSubject]);

    const handleClick = () => {
        if (isSubmitClicked) {
            handleSendWhatsApp();
        } else {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000); // Hide after 3 seconds
        }
    };

    return (
        <div className="relative w-full group">
            <button
                onClick={handleClick}
                className={`w-full px-5 py-3 font-semibold rounded-lg shadow-lg transition-transform transform duration-300 ease-in-out ${isSubmitClicked ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 active:bg-green-700 active:shadow-md' : 'bg-green-400 text-gray-300 cursor-not-allowed'} text-sm uppercase`}
                disabled={!isSubmitClicked}
                aria-label="Send to WhatsApp"
                aria-live="polite"
            >
                <>
                    <img src={WhatsAppIcon} alt="WhatsApp Icon" className="w-6 h-6 inline-block mr-2" />
                    Send to WhatsApp
                </>
            </button>
            {!isSubmitClicked && (
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max p-2 rounded-lg bg-black text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="block">
                        Please click Submit to view the result first
                    </span>
                </div>
            )}
        </div>
    );
};

WhatsAppButton.propTypes = {
    isSubmitClicked: PropTypes.bool.isRequired,
    result: PropTypes.object.isRequired,
    selectedClass: PropTypes.string.isRequired,
    selectedSubject: PropTypes.string.isRequired,
    isManualSubject: PropTypes.bool.isRequired,
};

export default WhatsAppButton;