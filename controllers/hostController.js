const Home = require("../models/home");
const fs = require("fs");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to StayHub",
    currentPage: "addHome",
    editing: false,
    home: null,
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  console.log("Body Data:", req.body);
  console.log("Files Object:", req.files);
  const { houseName, price, location, rating, description } = req.body;

  // Since we used upload.fields(), we look in req.files
  const photoPath = req.files['photo'] ? req.files['photo'][0].path : null;
  
  // Get the filename for the houseRules
  const rulesFileName = req.files['rulesDocument'] ? req.files['rulesDocument'][0].filename : null;

  if (!photoPath) {
    return res.status(422).send("No image provided");
  }

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo: photoPath,
    houseRules: rulesFileName, // This matches your schema field
    description,
  });

  home.save()
    .then(() => {
      console.log("Home Saved with rules:", rulesFileName);
      res.redirect("/host/host-home-list");
    })
    .catch(err => console.log(err));
};

const path = require('path');
const rootDir = require("../utils/pathUtil");

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;

  Home.findById(id)
    .then((home) => {
      if (!home) {
        return res.redirect("/host/host-home-list");
      }

      // Update text fields
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;

      // 1. Handle Photo Update
      if (req.files && req.files['photo']) {
        // Delete old photo file if it exists
        if (home.photo) {
          fs.unlink(path.join(rootDir, home.photo), (err) => {
            if (err) console.log("Old photo delete error:", err);
          });
        }
        home.photo = req.files['photo'][0].path;
      }

      // 2. Handle Rules Document Update
      if (req.files && req.files['rulesDocument']) {
        // Delete old rules file if it exists
        if (home.houseRules) {
          fs.unlink(path.join(rootDir, 'rules', home.houseRules), (err) => {
            if (err) console.log("Old rules delete error:", err);
          });
        }
        // Save the new filename
        home.houseRules = req.files['rulesDocument'][0].filename;
      }

      return home.save();
    })
    .then((result) => {
      console.log("Home updated successfully");
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error while updating:", err);
      res.redirect("/host/host-home-list");
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log("Came to delete ", homeId);
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error while deleting ", error);
    });
};