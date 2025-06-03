# PostgreSQL Client Module for Node.js/Express

This module provides a simple and reusable way to configure and connect to a PostgreSQL database using the `pg` library. It is designed for easy integration with Express.js applications, but can be used in any Node.js project.

## Setup

1. **Module Location**
   - The `pgClient.js` file is located in the `pg` folder:
     ```
     your-project/
     ├── pg/
     │   └── pgClient.js
     └── app.js
     ```

2. **Install Dependencies**
   - Make sure you have the `pg` package installed:
     ```sh
     npm install pg
     ```
   - (Optional) Use `dotenv` for environment variables:
     ```sh
     npm install dotenv
     ```

3. **Configure Environment Variables**
   - Create a `.env` file in your project root with the following variables:
     ```env
     PG_USER=your_db_user
     PG_HOST=your_db_host
     PG_DATABASE=your_db_name
     PG_PASSWORD=your_db_password
     PG_PORT=5432
     ```

## Basic Usage in Express

```js
// app.js
const express = require('express');
const { createPgClient, connectPgClient } = require('./pg/pgClient');

const app = express();
const client = createPgClient();
connectPgClient(client);

app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('Database error');
  }
});

// Example route with EJS rendering
app.get('/users/view', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users');
    res.render('users', { users: result.rows });
  } catch (err) {
    res.status(500).send('Database error');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## API

- `createPgClient(configOverrides)`: Returns a new `pg.Client` instance. You can override any config by passing an object.
- `connectPgClient(client)`: Connects the provided client and logs the status.

---

**Note:**
- Always handle errors in production code.
- You can reuse this module in multiple apps by importing it from the `pg` folder.
