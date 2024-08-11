import { useState } from 'react';

const SpeakTest = () => {
    const [spokenMessage, setSpokenMessage] = useState('');
    const [spokenName, setSpokenName] = useState('');

    const speakNames = (names) => {
        const greetings = {
            "Samuvel": "Good Morning Samuvel",
            "Akash": "Good Evening Akash",
            "Unknown": " "
        };

        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.toLowerCase().includes('male'));
        const defaultVoice = voices.find(voice => voice.lang === 'en-US');

        names.forEach((name) => {
            const message = greetings[name] || `Hello ${name}`;
            const utterance = new SpeechSynthesisUtterance(message);

            utterance.voice = selectedVoice || defaultVoice || voices[0];
            utterance.lang = 'en-US';
            utterance.pitch = 1;
            utterance.rate = 1;
            utterance.volume = 1;

            speechSynthesis.speak(utterance);

            // Update state to display spoken message and name
            setSpokenMessage(message);
            setSpokenName(name);
        });
    };

    const handleSpeak = () => {
        const namesToSpeak = ["Akash"]; // Example names to test
        speakNames(namesToSpeak);
    };

    return (
        <div className="container">
            <h2 className="title">Speech Synthesis Test</h2>
            <button
                onClick={handleSpeak}
                className="button button-blue"
            >
                Speak Names with Male Voice
            </button>
            {spokenName && (
                <div className="spoken-message">
                    <p>Spoken Name: {spokenName}</p>
                    <p>Message: {spokenMessage}</p>
                </div>
            )}
        </div>
    );
};

export default SpeakTest;
