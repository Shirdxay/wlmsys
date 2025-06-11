const express = require('express');
const mongoose = require('mongoose');
//const { createPgClient, connectPgClient } = require('./pg/pgClient');
const { convertUTCToLocal } = require('./helperFunc');
const {client, connectPg} = require('./pg/pg');


// Load environment variables from .env file
require('dotenv').config();

//express app
const app = express();

/* postgres DB*/
//const client = createPgClient();
//connectPgClient(client);
// Connect to PostgreSQL (Render/Local)
connectPg();

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));

//register view engine
app.set('view engine', 'ejs');

//serve static files under public directory
//appending the prefixpath to the url will serve the static files under public directory
app.use('/prefixpath', express.static('public'));
app.use(express.urlencoded({ extended: true })); //parse urlencoded data to nodejs objects
app.use(express.json()); //parse json data to nodejs objects (allow for direct access to req.body)

//set up routes
app.get('/', async (req, res) => {
  try {
    //temporarily filter out flows with null q_planned values
    const flows = await client.query('select * from selectopts where q_planned is not null order by id');
    res.render('index', {
      title: 'WLMSys',
      flowRows: flows.rows}
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


//handle form submission
app.post('/submit', async (req, res) => {
  const { options,waterLevel, gateOpening, gpsLocation, q_planned,q_actual,k} = req.body;
  const [lat, long] = gpsLocation.split(',').map(Number);

  const selectFlowID = options.split('_')[0]; //extract flow_id from the selected option
  const image_url = "https://example.com/image1.jpg"; //temporary hardcoded value, should be replaced with actual image URL logic

  //insert data into the database and retrieve today's entries for the selected flow_id
  try {
    const insertQuery = 'INSERT INTO records (flow_id, gate_opening, water_level, latitude, longitude, image_url, q_planned,q_actual,k) VALUES ($1, $2, $3, $4, $5, $6,$7,$8, $9)';
    await client.query(
      insertQuery,
      [selectFlowID, gateOpening, waterLevel, lat, long, image_url, q_planned,q_actual,k]
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Database insert error' });
  }
  try{
    // Fetch today's entries for the selected flow_id
    const todayEntriesQuery = 'SELECT * FROM records_view WHERE flow_id = $1 AND timestamp >= CURRENT_DATE ORDER BY timestamp DESC';
    const result = await client.query(todayEntriesQuery, [selectFlowID]);
    // Clear previous entries for this flow_id
    const entries = [];
    result.rows.forEach(row => {
      entries.push({
        Flow_ID: row.flow_id,
        Structures_In_Out_Device: row.structures_in_out_device,
        Gate_Opening: row.gate_opening,
        Water_Level: row.water_level,
        Q_actual: row.q_actual,
        Q_planned: row.q_planned,
        K: row.k,
        Latitude: row.latitude,
        Longitude: row.longitude ,
        Timestamp: convertUTCToLocal(row.timestamp),

      });
    });
    // send response with message and today's entries
    res.json({
      success: true,
      message: 'Successfully',
      entries: entries
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Database insert error' });
  }
});

//404 page (must be at the end)
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
