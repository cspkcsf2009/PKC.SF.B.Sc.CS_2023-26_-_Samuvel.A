document.addEventListener('DOMContentLoaded', function () {
    const toggleDarkMode = document.getElementById('toggleDarkMode');
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const topicsTable = document.getElementById('topicsTable');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    let topics = [];
    let filteredTopics = [];
    let currentPage = 1;
    const itemsPerPage = 7;

    // Initialize
    loadPredefinedData();
    initializeDarkMode();

    // Event listeners
    toggleDarkMode.addEventListener('change', toggleDarkModeHandler);
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    clearSearch.addEventListener('click', clearSearchInput);
    prevPage.addEventListener('click', () => changePage(-1));
    nextPage.addEventListener('click', () => changePage(1));

    function loadPredefinedData() {
        showLoadingSpinner();

        // Fetch the predefinedData.json file
        fetch('predefinedData.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load JSON');
                }
                return response.json();
            })
            .then(data => {
                topics = data;
                filteredTopics = [...topics];
                // Cache the data in localStorage for faster future loads
                localStorage.setItem('topicsData', JSON.stringify(data));
                hideLoadingSpinner();
                renderTopics();
            })
            .catch(error => {
                console.error('Error fetching predefined data:', error);
                showError('Failed to load topics. Please try again later.');
                hideLoadingSpinner();
            });
    }

    function renderTopics() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageTopics = filteredTopics.slice(startIndex, endIndex);

        const tbody = topicsTable.querySelector('tbody');
        tbody.innerHTML = '';
        pageTopics.forEach((item, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td class="topicLeft">${item.topic}</td>
                <td>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-external-link-alt"></i> Go to Topic
                    </a>
                </td>
            `;
        });

        updatePagination();
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === totalPages;
    }

    function changePage(direction) {
        currentPage += direction;
        renderTopics();
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        filteredTopics = topics.filter(item =>
            item.topic.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        renderTopics();
    }

    function clearSearchInput() {
        searchInput.value = '';
        filteredTopics = [...topics];
        currentPage = 1;
        renderTopics();
    }

    function toggleDarkModeHandler() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }

    function showLoadingSpinner() {
        loadingSpinner.style.display = 'block';
    }

    function hideLoadingSpinner() {
        loadingSpinner.style.display = 'none';
    }

    function initializeDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            toggleDarkMode.checked = true;
        }
    }

    function showError(message) {
        console.error(message);
        // Implement your error display mechanism here (e.g., showing a message on the page)
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});