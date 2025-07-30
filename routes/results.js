const express = require("express");
const router = express.Router();
const { addResult, getResults, getResultsByScanId, getResultsByUserId } = require("../controllers/resultController");

router.get("/", getResults);
router.get("/:userId", getResultsByUserId);
router.get("/scan/:scanId", getResultsByScanId); 
router.post("/", addResult);

module.exports = router;
