const express = require('express');
var cors = require('cors');

const PORT = 3001;

const app = new express();
app.use(express.json());
app.use(cors());

const gear = require('./routes/gear');
const pid = require('./routes/pid');

app.use('/api/gear', gear);
app.use('/api/pid', pid);

app.get('/api/info', (req, res) => {
    data = {
        name: "phoenix",
        gear: 11,
        servo: 1,
        last_calibration: "2020-01-01"
    }
    res.json(data);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));

module.exports = app;