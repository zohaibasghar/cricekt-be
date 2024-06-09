const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); // express value validator
const fetchUser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");

// Route 1: fetch all notes according to the logged in user: GEt: http://localhost:5000/api/notes/fetchnotes
router.get("/fetchnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error);
  }
});

// Route 2: add a note and store it to the logged in user POST: http://localhost:5000/api/notes/addnote
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Title is blank.").exists(),
    body("description", "Description is Required.").exists(),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = await new Notes({
        user: req.user.id,
        title: title,
        description: description,
        tag: tag,
      }).save();
      res.json(note);
    } catch (error) {
      res.send({ error });
    }
  }
);

// Route 3: Updation a note to the logged in user PUT: http://localhost:5000/api/notes/updatenote
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const noteUpdate = {};
    if (title) {
      noteUpdate.title = title;
    }
    if (description) {
      noteUpdate.description = description;
    }
    if (tag) {
      noteUpdate.tag = tag;
    }
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorized Access");
    }
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: noteUpdate },
      { new: true }
    );
    res.send(note);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Route 4: Deleting a note to the logged in user DELETE: http://localhost:5000/api/notes/deletenote
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorized Access");
    }
    note = await Notes.findByIdAndDelete(req.params.id);
    res.send("Success! Note has been deleted");
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
