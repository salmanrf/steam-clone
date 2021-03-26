const express = require("express");
const router = express.Router();
const game_conn = require("../controllers/game_controller");

router.get("/game/", game_conn.game_list_json);

module.exports = router;
