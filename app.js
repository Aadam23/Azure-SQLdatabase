const express = require('express');
const sql = require('mssql');
const path = require('path'); // Add this line

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (like your HTML, CSS, and JS)
app.use(express.static(path.join(__dirname))); // Add this line

// Database configuration
const dbConfig = {
    user: 'username', // replace with your admin username
    password: 'userpassword', // replace with your password
    server: 'myservername.database.windows.net', // replace with your server name
    database: 'TestDatabase',
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

// Connect to the database
sql.connect(dbConfig)
    .then(pool => {
        console.log('Connected to the database!');

        // Define a route to get employees
        app.get('/employees', async (req, res) => {
            try {
                const result = await pool.request().query('SELECT * FROM Employees');
                res.json(result.recordset); // Send the employee records as JSON
            } catch (err) {
                console.error('SQL error', err);
                res.status(500).send('Error retrieving employees');
            }
        });

        // Define a route to add a new employee
        app.post('/employees', async (req, res) => {
            const { FirstName, LastName, JobTitle, Salary } = req.body; // Destructure request body
            try {
                await pool.request()
                    .input('FirstName', sql.NVarChar, FirstName)
                    .input('LastName', sql.NVarChar, LastName)
                    .input('JobTitle', sql.NVarChar, JobTitle)
                    .input('Salary', sql.Float, Salary)
                    .query('INSERT INTO Employees (FirstName, LastName, JobTitle, Salary) VALUES (@FirstName, @LastName, @JobTitle, @Salary)');

                res.status(201).send('Employee added successfully'); // Respond with success
            } catch (err) {
                console.error('SQL error', err);
                res.status(500).send('Error adding employee'); // Handle error
            }
        });

        // Define a route to delete an employee
        app.delete('/employees/:id', async (req, res) => {
            const employeeId = req.params.id;
            try {
                await pool.request()
                    .input('EmployeeID', sql.Int, employeeId)
                    .query('DELETE FROM Employees WHERE EmployeeID = @EmployeeID');
                res.status(200).send('Employee deleted successfully');
            } catch (err) {
                console.error('SQL error', err);
                res.status(500).send('Error deleting employee');
            }
        });

        // Define a route to get a specific employee by ID
        app.get('/employees/:id', async (req, res) => {
            const employeeId = req.params.id;
            try {
                const result = await pool.request()
                    .input('EmployeeID', sql.Int, employeeId)
                    .query('SELECT * FROM Employees WHERE EmployeeID = @EmployeeID');
                res.json(result.recordset[0]); // Send the employee record as JSON
            } catch (err) {
                console.error('SQL error', err);
                res.status(500).send('Error retrieving employee');
            }
        });

        // Define a route to update an employee
        app.put('/employees/:id', async (req, res) => {
            const employeeId = req.params.id;
            const { FirstName, LastName, JobTitle, Salary } = req.body;

            try {
                await pool.request()
                    .input('EmployeeID', sql.Int, employeeId)
                    .input('FirstName', sql.NVarChar, FirstName)
                    .input('LastName', sql.NVarChar, LastName)
                    .input('JobTitle', sql.NVarChar, JobTitle)
                    .input('Salary', sql.Float, Salary)
                    .query('UPDATE Employees SET FirstName = @FirstName, LastName = @LastName, JobTitle = @JobTitle, Salary = @Salary WHERE EmployeeID = @EmployeeID');

                res.status(200).send('Employee updated successfully');
            } catch (err) {
                console.error('SQL error', err);
                res.status(500).send('Error updating employee');
            }
        });

        // Define a route to serve the index.html file
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html')); // Serve the index.html file
        });
    })
    .catch(err => {
        console.error('Database connection failed', err);
    });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
