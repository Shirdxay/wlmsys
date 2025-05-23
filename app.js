const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

//express app
const app = express();

//connect to mongodb
const dbURI = process.env.MONGODB_URI;
mongoose
  .connect(dbURI)
  .then(() => {
    console.log('Connected to database');
    //listen for requests
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//register view engine
app.set('view engine', 'ejs');

//serve static files under public directory
//appending the prefixpath to the url will serve the static files under public directory
app.use('/prefixpath', express.static('public'));
//parse urlencoded data
app.use(express.urlencoded({ extended: true }));
//parse json data
app.use(express.json());

//set up routes
//mlist is temporary data
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    mlist: [
      'Laos,Thailand',
      'Vietnam',
      'Cambodia',
      'Myanmar',
      'Malaysiabc',
      'Singapore',
      'Brunei',
      'Philippines',
      'Indonesia',
      'Timor-LesteABC',
    ],
  });
});

//404 page (must be at the end)
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
