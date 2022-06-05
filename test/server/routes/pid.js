let express = require('express');

let router = express.Router();

router.get('', (req, res) => {
    res.json({
        "Kp": 10.0,
        "Ki": 10.1,
        "Kd": 10.2, 
    });
});

router.put("", (req, res) => {
    console.log(req.query);
    console.log(req.body);
    res.json(req.body);
});

module.exports = router;