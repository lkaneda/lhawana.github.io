async function populateHeaderFieldDropdown() {
    try {
        const response = await fetch('data.tsv');
        const csvData = await response.text();
        const rows = csvData.split('\n');

        const headers = rows[0].split('\t');
        const headerFieldDropdown = document.getElementById("headerField");

        const option = document.createElement('option');
        option.text = "Any";
        option.value = -1; // Set the value of the option to its index
        headerFieldDropdown.add(option);

        headers.forEach((header, index) => {
            const option = document.createElement('option');
            option.text = header.trim();
            option.value = index; // Set the value of the option to its index
            headerFieldDropdown.add(option);
        });

        // Populate the table with the CSV data
        const table = document.getElementById("searchResultsTable");
        for (let i = 0; i < rows.length; i++) {
            const rowData = rows[i].split('\t');
            const row = table.insertRow();
            for (let j = 0; j < rowData.length; j++) {
                const cell = row.insertCell();
                if (headers[j].trim().toLowerCase() === 'website') {
                    // Check if it's a header cell or data cell
                    if (i === 0) {
                        // If it's a header cell, don't make it a link
                        cell.style.textAlign = 'center'; // Center-align text
                        cell.style.backgroundColor = '#6de8af'; // Light green background color
                        const boldText = document.createElement('strong');
                        boldText.textContent = rowData[j].trim();
                        cell.appendChild(boldText);
                    } else {
                        // If it's a data cell, make it a link
                        const link = document.createElement('a');
                        link.href = rowData[j].trim();
                        link.target = "_blank"; // Open link in new tab
                        link.textContent = rowData[j].trim();
                        cell.appendChild(link);
                    }
                } else {
                    // For non-website cells, just insert text content
                    if (i === 0) {
                        cell.style.textAlign = 'center'; // Center-align text
                        cell.style.backgroundColor = '#6de8af'; // Light green background color
                        const boldText = document.createElement('strong');
                        boldText.textContent = rowData[j].trim();
                        cell.appendChild(boldText);
                    } else {
                        cell.textContent = rowData[j].trim();
                    }
                }
            }
            // Add event listener to each row
            row.addEventListener('click', function() {
                if (rowData[0].trim().toLowerCase() != 'company') {
                    clearPopups(); // Clear existing pop-ups before displaying a new one
                    displayRowDetails(headers, rowData, row);
                }
            });
        }
        // Add event listeners to header cells for sorting
        const headerRow = table.rows[0]; // Get the first row (header row) of the table
        const headerCells = headerRow.querySelectorAll('td'); // Select header cells from the header row
        headerCells.forEach((headerCell, index) => {
            headerCell.addEventListener('click', () => {
                sortTable(table, index);
            });
        });
    } catch (error) {
        console.error('Error populating header field dropdown:', error);
    }
}

function clearPopups() {
    const existingPopups = document.querySelectorAll('.modal-container');
    existingPopups.forEach(popup => popup.remove());
}

function displayRowDetails(headers, rowData, clickedRow) {
    // Create a modal container
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');
    
    // Create a modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    
    // Create a close button
    const closeButton = document.createElement('span');
    closeButton.classList.add('close-button');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
        modalContainer.style.display = 'none';
    });

    // Create paragraph elements for each header and corresponding row data
    headers.forEach((header, index) => {
        const paragraph = document.createElement('p');
        const boldHeader = document.createElement('strong');
        boldHeader.textContent = `${header.trim()}: `;
        paragraph.appendChild(boldHeader);
        // If the header is "Website" and it's a data cell, create a hyperlink
        if (header.trim().toLowerCase() === 'website') {
            const link = document.createElement('a');
            link.href = rowData[index].trim();
            link.textContent = rowData[index].trim();
            link.target = "_blank"; // Open link in new tab
            paragraph.appendChild(link);
        } else {
            // For other headers, just display the text content
            paragraph.innerHTML += rowData[index].trim();
        }
        modalContent.appendChild(paragraph);
    });

    // Append elements to modal content
    modalContent.appendChild(closeButton);
    
    // Append modal content to modal container
    modalContainer.appendChild(modalContent);

    // Append modal container to body
    clickedRow.parentNode.insertBefore(modalContainer, clickedRow.nextSibling);

    // Display the modal
    modalContainer.style.display = 'block';
}

function search() {
    var searchInput = document.getElementById("searchInput").value.trim().toUpperCase();
    var headerToSearchIndex = parseInt(document.getElementById("headerField").value);
    var table = document.getElementById("searchResultsTable");
    var rows = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (var i = 1; i < rows.length; i++) { // Start from 1 to skip header row
        var cells = rows[i].getElementsByTagName("td");
        var matchFound = false;
        if (headerToSearchIndex === -1) {
            // Search all columns if headerToSearchIndex is -1
            for (var j = 0; j < cells.length; j++) {
                var cellValue = cells[j].textContent.toUpperCase();
                if (cellValue.includes(searchInput)) {
                    matchFound = true;
                    break;
                }
            }
        } else {
            var cellValue = (cells[headerToSearchIndex]) ? cells[headerToSearchIndex].textContent.toUpperCase() : '';
            matchFound = cellValue.includes(searchInput);
        }
        if (matchFound) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
    clearPopups()
}

function resetSearch() {
    var table = document.getElementById("searchResultsTable");
    var rows = table.getElementsByTagName("tr");

    // Loop through all table rows, and show them
    for (var i = 1; i < rows.length; i++) { // Start from 1 to skip header row
        rows[i].style.display = "";
    }

    // Clear search input
    document.getElementById("searchInput").value = "";

    // Reset headerFieldDropdown to value "Any"
    document.getElementById("headerField").selectedIndex = 0;

    // Clear popup
    clearPopups()
}

function sortTable(table, columnIndex) {
    const rows = Array.from(table.rows).slice(1); // Exclude header row
    const isAscending = table.rows[0].cells[columnIndex].classList.contains('asc');

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        return isAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });

    // Update the table with the sorted rows
    rows.forEach((row, index) => {
        table.appendChild(row);
    });

    // Toggle sorting direction indicator
    table.rows[0].cells[columnIndex].classList.toggle('asc');
}

// Populate the header field dropdown and table when the page loads
populateHeaderFieldDropdown();
