const express = require("express");
const router = express.Router();
const { addResult, getResults, getResultsByUserId } = require("../controllers/resultController");

router.get("/", getResults);
router.get("/:userId", getResultsByUserId);
router.post("/", addResult);

module.exports = router;
