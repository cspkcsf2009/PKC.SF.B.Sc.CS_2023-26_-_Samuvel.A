document.addEventListener('DOMContentLoaded', function () {
    loadPredefinedData();
});

function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    const adminControls = document.getElementById('adminControls');
    const toggleButton = document.getElementById('toggleAdmin');

    if (adminPanel.classList.contains('hidden')) {
        adminPanel.classList.remove('hidden');
        toggleButton.textContent = "Switch to User View";
    } else {
        adminPanel.classList.add('hidden');
        adminControls.classList.add('hidden');
        toggleButton.textContent = "Switch to Admin Panel";
    }
}

function validatePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const adminControls = document.getElementById('adminControls');
    const errorMessage = document.getElementById('errorMessage');

    const correctPassword = 'admin123'; // Change this to your desired password

    if (passwordInput.value === correctPassword) {
        adminControls.classList.remove('hidden');
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'Incorrect password!';
    }
}

function addTopic() {
    const topicInput = document.getElementById('topicInput');
    const urlInput = document.getElementById('urlInput');
    const errorMessage = document.getElementById('errorMessage');
    const topic = topicInput.value.trim();
    const url = urlInput.value.trim();

    errorMessage.textContent = '';

    if (topic === "" || url === "") {
        errorMessage.textContent = "Both topic and URL are required!";
        return;
    }

    if (!isValidURL(url)) {
        errorMessage.textContent = "Please enter a valid URL!";
        return;
    }

    const table = document.getElementById('topicsTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const rowNumCell = newRow.insertCell(0);
    rowNumCell.textContent = table.rows.length;

    const topicCell = newRow.insertCell(1);
    topicCell.textContent = topic;

    const navCell = newRow.insertCell(2);
    const navButton = document.createElement('button');
    navButton.textContent = 'Go';
    navButton.onclick = function () {
        window.open(url, '_blank');
    };
    navCell.appendChild(navButton);

    topicInput.value = '';
    urlInput.value = '';
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function loadPredefinedData() {
    const predefinedTopics = [
        { topic: '2. Abstraction & Encapsulation', url: 'https://docs.google.com/document/d/17YJULE8l86ohKEVuMD5rT4ZGUEB7D1ulz_AlkbRoUMc/edit?usp=sharing' },
        { topic: '3. Assignment Set 1', url: 'https://docs.google.com/document/d/1Ub1qBYpSOUSXjq6ndyrLQnNNqBFESzS0zxiYl2IbCz0/edit?usp=sharing' },
        { topic: '4. Static', url: 'https://docs.google.com/document/d/1Ot2NOqvmuW_DNSH_MAUeBrCW0pnZiU44Qh45aLjTKSo/edit?usp=sharing' },
        { topic: '5. Assignment Set 2', url: 'https://docs.google.com/document/d/1vLME2BdCWX07IG_Qw9iYlqg2dtLsLPlImlGOs3hGhcQ/edit?usp=sharing' },
        { topic: '6. Class Relationships', url: 'https://docs.google.com/document/d/1maxBfuCxWF9FGnwTSfpwnZpJR6spzUtAySqolPLfM24/edit?usp=sharing' },
        { topic: '7. Assignment Set 3', url: 'https://docs.google.com/document/d/1p5LKZSeYCGBuKeW2hykaXDoVqSu1FWFhAn0ZQluSh_s/edit?usp=sharing' },
    ];

    const table = document.getElementById('topicsTable').getElementsByTagName('tbody')[0];

    predefinedTopics.forEach((item, index) => {
        const newRow = table.insertRow();

        const rowNumCell = newRow.insertCell(0);
        rowNumCell.textContent = index + 1;

        const topicCell = newRow.insertCell(1);
        topicCell.textContent = item.topic;

        const navCell = newRow.insertCell(2);
        const navButton = document.createElement('button');
        navButton.textContent = 'Go';
        navButton.onclick = function () {
            window.open(item.url, '_blank');
        };
        navCell.appendChild(navButton);
    });
}