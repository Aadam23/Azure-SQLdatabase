// Function to fetch employee data and populate the table
async function fetchEmployees() {
    try {
        const response = await fetch('/employees'); // Fetch employee data from the server
        const employees = await response.json(); // Parse JSON response

        const tableBody = document.querySelector('#employeeTable tbody'); // Get table body element
        tableBody.innerHTML = ''; // Clear existing table data

        // Populate the table with employee data
        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.EmployeeID}</td>
                <td>${employee.FirstName}</td>
                <td>${employee.LastName}</td>
                <td>${employee.JobTitle}</td>
                <td>${employee.Salary}</td>
                <td>
                    <button onclick="editEmployee(${employee.EmployeeID})">Edit</button>
                    <button onclick="deleteEmployee(${employee.EmployeeID})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row); // Append the row to the table body
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
    }
}

// Call the function to fetch employees when the page loads
window.onload = fetchEmployees;

// Function to show the Add Employee form
function showAddForm() {
    document.getElementById('addForm').style.display = 'block'; // Show the add form
}

// Function to cancel adding an employee
function cancelAdd() {
    document.getElementById('addForm').style.display = 'none'; // Hide the add form
}

// Add event listener to the Add button
document.getElementById('addButton').addEventListener('click', async () => {
    const newEmployee = {
        FirstName: document.getElementById('addFirstName').value,
        LastName: document.getElementById('addLastName').value,
        JobTitle: document.getElementById('addJobTitle').value,
        Salary: document.getElementById('addSalary').value
    };

    try {
        const response = await fetch('/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEmployee)
        });

        if (response.ok) {
            console.log('Employee added successfully');
            fetchEmployees(); // Refresh the employee list after addition
            cancelAdd(); // Hide the add form
        } else {
            console.error('Failed to add employee:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding employee:', error);
    }
});

// Add functions for edit and delete actions
async function editEmployee(employeeId) {
    try {
        const response = await fetch(`/employees/${employeeId}`);
        const employee = await response.json();

        // Populate the edit form with employee data
        document.getElementById('editEmployeeId').value = employee.EmployeeID;
        document.getElementById('editFirstName').value = employee.FirstName;
        document.getElementById('editLastName').value = employee.LastName;
        document.getElementById('editJobTitle').value = employee.JobTitle;
        document.getElementById('editSalary').value = employee.Salary;

        // Show the edit form
        document.getElementById('editForm').style.display = 'block';
    } catch (error) {
        console.error('Error fetching employee for edit:', error);
    }
}

// Add a function to save the changes
document.getElementById('saveButton').addEventListener('click', async () => {
    const employeeId = document.getElementById('editEmployeeId').value;
    const updatedEmployee = {
        FirstName: document.getElementById('editFirstName').value,
        LastName: document.getElementById('editLastName').value,
        JobTitle: document.getElementById('editJobTitle').value,
        Salary: document.getElementById('editSalary').value
    };

    try {
        const response = await fetch(`/employees/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedEmployee)
        });

        if (response.ok) {
            console.log('Employee updated successfully');
            fetchEmployees(); // Refresh the employee list after update
            cancelEdit(); // Hide the edit form
        } else {
            console.error('Failed to update employee:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating employee:', error);
    }
});

function cancelEdit() {
    document.getElementById('editForm').style.display = 'none'; // Hide the edit form
}

async function deleteEmployee(employeeId) {
    try {
        const response = await fetch(`/employees/${employeeId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('Employee deleted successfully');
            fetchEmployees(); // Refresh the employee list after deletion
        } else {
            console.error('Failed to delete employee:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
    }
}