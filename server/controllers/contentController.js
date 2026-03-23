const Content = require("../models/Content");

const getContent = async (req, res, next) => {
  try {
    const { section } = req.query;
    const query = section ? { section } : {};
    const content = await Content.find(query).sort("section key");
    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const { section, key, value, type } = req.body;
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { section, key, value, type },
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

const upsertContent = async (req, res, next) => {
  try {
    const { section, key, value, type } = req.body;
    const content = await Content.findOneAndUpdate(
      { section, key },
      { section, key, value, type },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, content });
  } catch (error) {
    next(error);
  }
};

const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }
    res.json({ success: true, message: "Content deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContent, updateContent, upsertContent, deleteContent };
