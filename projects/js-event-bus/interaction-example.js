// app.js - Example application with emoji-marked sections

// 🟢 START: Imports 🟢
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
// 🔴 END: Imports 🔴

// 🟦 START: Configuration 🟦
const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';
// 🟧 END: Configuration 🟧

// 🟢 START: Middleware Setup 🟢
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// 🔴 END: Middleware Setup 🔴

// 🟦 START: Route Definitions 🟦
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/about', (req, res) => {
  res.send('About page');
});

app.get('/users', (req, res) => {
  res.send('Users list');
});
// 🟧 END: Route Definitions 🟧

// 🚨 START: Error Handling 🚨
app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// 🛑 END: Error Handling 🛑

// 🟢 START: Server Initialization 🟢
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (isDevelopment) {
    console.log('Running in development mode');
  }
});
// 🔴 END: Server Initialization 🟢
