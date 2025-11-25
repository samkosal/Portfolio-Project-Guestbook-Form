// Import the express module
import express from "express";

// Import the express module
import mysql2 from 'mysql2';

import dotenv from 'dotenv';

dotenv.config();

// Create a CONNECTION POOL to the database
// Now using environment variables from the .env file
// process.env.VARIABLE_NAME accesses variables from .env
const pool = mysql2.createPool({
    // These values come from the .env file
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT


}).promise();

// Create an instance of an Express application
const app = express();

// Set EJS as our view engine
app.set('view engine', 'ejs');

// Enable static files serving
app.use(express.static("public"));

// Allow the app to parse form data (req.body)
app.use(express.urlencoded({ extended: true }));

// Create an array to store orders
const orders = [];

// Define the port number where our server will listen
const PORT = 3002;

// Database test - http://localhost:3002/db-test to test this route
app.get('/db-test', async(req, res) => {


    /* 
     * 'async' tells JavaScript that this function will do asynchronous work
     * Asynchronous means "it takes time to complete" (like waiting for
     * database). By marking it 'async', we can use 'await' inside it
     * 
     * 'await' keyword means "pause here and wait for the database to respond"
     * pool.query() returns a Promise ("I'll get back to you!")
     * 'await' waits for the Promise to complete before moving on
     * 
     * DESTRUCTURING with [orders]:
     * pool.query() returns an ARRAY with 2 items:
     *   [0] = the actual data rows from the database
     *   [1] = metadata about the query (field names, types, etc.)
     * By writing [orders], we're saying "just give me the first item"


     * This is called "array destructuring"
     * So 'orders' now contains just the data rows, like:
     * [ {id: 1, customer: 'John', pizza: 'Pepperoni'}, 
     *   {id: 2, customer: 'Jane', pizza: 'Veggie'} ]
     */


    // try/catch block for error handling
    try {


        const [orders] = await pool.query('SELECT * FROM orders');


        // Send the orders data back to the browser as JSON
        res.send(orders);


    } catch(err) {


        // If ANY error happened in the 'try' block, this code runs
        // Log the error to the server console (for developers to see)
        console.error('Database error:', err);


        // Send an error response to the browser
        // status(500) means "Internal Server Error"
        res.status(500).send('Database error: ' + err.message);
    }
});

// Define a default "route" ('/')
// req: contains information about the incoming request
// res: allows us to send back a response to the client
app.get("/", (req, res) => {
  // Send "Helow, World!" as a resonce to the client
  // res.send('<h1> Welcome to Poppa\'s Pizza!</h1>');
  // res.sendFile(`${import.meta.dirname}/views/home.html`);
  res.render('home');
});

// Define an "admin" route
// Admin route - displays all orders from the database
app.get('/admin', async(req, res) => {


    try {
        // Fetch all orders from the database, newest first
        const [orders] = await 
        pool.query('SELECT * FROM orders ORDER BY timestamp DESC');


        // Optional: Format timestamps for better display
        orders.forEach(order => {


            order.formattedTimestamp = new 
            Date(order.timestamp).toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        });


        // Render the admin page with the orders
        res.render('admin', { orders: orders });


    } catch(err) {


        console.error('Database error:', err);
        res.status(500).send('Database error: ' + err.message);
    }


});

app.get('/contact-us', (req, res) => {
    res.render('contact');
});  

// app.post('/submit-order', (req, res) => {

//     //console.log(req.body);

//     // Create a JSON object to store the data
//     const order = req.body;
//     order.timestamp = new Date()

//     // Add order to array
//     orders.push(order);
//     console.log(orders);

//     // Send user to confirmation page
//     res.render('confirmation', { order });
// });

// This handles POST requests to /submit-order (when the user submits the pizza order form)
app.post('/submit-order', async(req, res) => {


    // Wrap everything in try/catch to handle potential database errors


    try {


        // Get the order data from the form submission


        // req.body contains all the form fields (fname, lname, email, etc.)
        const order = req.body;


        //check if email format is checked or not
        if (typeof order.method === "undefined") {
            order.method = "";
        }
        //check if user wants mailing list
        if (typeof order.mailing === "undefined") {
            order.mailing = "No";
        }
        // Convert the toppings array into a comma-separated string
        // HTML checkboxes submit as an array, but MySQL stores as TEXT
        order.toppings = Array.isArray(order.toppings) ? 
	      order.toppings.join(", ") : "";


        // Add a timestamp to track when this order was placed
        order.timestamp = new Date();


        // Log the order to the server console (helpful for debugging)
        console.log('New order received:', order);


        // Define an SQL INSERT query
        // The ? are PLACEHOLDERS that will be replaced with actual values
        // This prevents SQL injection (a common security vulnerability)


        const sql = `INSERT INTO orders 
                     (fname, lname, jobname, companyname, linkedin, email, meet, other, message, mailing, method, timestamp) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


        // Create an array of parameters for each ? placeholder in order
        const params = [
            order.fname,
            order.lname,
            order.jobname,
            order.companyname,
            order.linkedin,
            order.email,
            order.meet,
            order.other,
            order.message,
            order.mailing,
            order.method,
            order.timestamp
        ];
        


        // Execute the query with the parameters
        const [result] = await pool.execute(sql, params);


        // Optional: You can access the newly inserted row's ID
        console.log('Order inserted with ID:', result.insertId);


        // Pass the order data to the confirmation page 
        res.render('confirmation', { order: order });


    } catch(err) {


        // If ANYTHING goes wrong, this runs
        console.error('Error inserting order:', err);


        // Check if it's a duplicate email error
        if (err.code === 'ER_DUP_ENTRY') {


            res.status(409).send('An order with this email already exists.');


        } else {


            // Generic error message for other issues
            res.status(500).send('Sorry, there was an error processing your order. Please try again.');
        }
    }
});

// start the server and make it listen on the port
// specified above
app.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
});