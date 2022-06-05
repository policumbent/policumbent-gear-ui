let express = require('express');

let router = express.Router();

router.get('/configuration', (req, res) => {
    res.json({
        "servo1": [ 
            { "id": 1, "position": { "up": 101, "down": 102 } },
            { "id": 2, "position": { "up": 103, "down": 104 } },
            { "id": 3, "position": { "up": 105, "down": 106 } },
            { "id": 4, "position": { "up": 107, "down": 108 } },
            { "id": 5, "position": { "up": 109, "down": 110 } },
            { "id": 6, "position": { "up": 111, "down": 112 } },
            { "id": 7, "position": { "up": 113, "down": 114 } },
            { "id": 8, "position": { "up": 115, "down": 116 } },
            { "id": 9, "position": { "up": 117, "down": 118 } },
            { "id": 10, "position": { "up": 119, "down": 120 } },
            { "id": 11, "position": { "up": 121, "down": 122 } },
        ]
    });
});

router.put("", (req, res) => {
    console.log(req.query);
    console.log(req.body);
    res.sendStatus(200);
});

module.exports = router;