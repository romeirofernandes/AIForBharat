const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const { requireAuth } = require("../middleware/auth");

// Feed — all issues with vote scores
router.get("/feed", requireAuth, forumController.getFeed);

// Issue votes
router.post("/issues/:id/vote", requireAuth, forumController.voteIssue);

// Comments
router.get("/issues/:id/comments", requireAuth, forumController.getComments);
router.post("/issues/:id/comments", requireAuth, forumController.addComment);

// Comment votes
router.post("/comments/:commentId/vote", requireAuth, forumController.voteComment);

// Issue workflow (read-only for public viewing)
router.get("/issues/:id/workflow", requireAuth, forumController.getIssueWorkflow);

module.exports = router;
