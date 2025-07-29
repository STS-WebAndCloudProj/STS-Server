const express = require("express");
const router = express.Router();
const { addResult, getResults } = require("../controllers/resultController"); // ← זה חשוב

router.get("/", getResults);
router.post("/", addResult);

module.exports = router;
