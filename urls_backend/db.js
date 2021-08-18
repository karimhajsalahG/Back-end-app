

const Pool = require('pg').Pool
const pool = new Pool({
user: "sayenoifntydyi",
host: 'ec2-54-76-249-45.eu-west-1.compute.amazonaws.com',
  database: 'dfm2ef67ul1to6',
  password: 'd3c317bd8dede41a58cf59a8dc7bf6812fcac792f0754925a0b3ff4a152bae32',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
})
module.exports= pool