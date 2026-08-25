const express = require('express');
const app = express();
const router = express.Router();

router.post("/:workspaceId/members", (req, res) => res.send("invite"));
router.post("/invitations/:invitationId/accept", (req, res) => res.send("accept"));

app.use("/workspaces", router);

const request = require('supertest');
request(app)
  .post('/workspaces/invitations/123/accept')
  .end(function(err, res) {
    console.log("RESPONSE:", res.text);
  });
