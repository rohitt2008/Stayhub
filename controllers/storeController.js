const Home = require("../models/home");
const User = require("../models/user");
const Booking = require("../models/booking");
const path = require("path");
const rootDir = require("../utils/pathUtil");

exports.getIndex = (req, res, next) => {
  console.log("Session Value: ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "StayHub Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn, 
      user: req.session.user,
    });
  });
};

exports.getBookings = async (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user && req.session.user._id ? req.session.user._id : null;
  if (!userId) {
    return res.redirect("/login");
  }

  const bookings = await Booking.find({ user: userId })
    .populate("home")
    .sort({ createdAt: -1 });

  res.render("store/bookings", {
    bookings,
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('favourites');
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn, 
    user: req.session.user,
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn, 
        user: req.session.user,
      });
    }
  });
};

exports.getReserveHome = (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }

  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      return res.redirect("/homes");
    }

    res.render("store/reserve", {
      home,
      errors: [],
      oldInput: {
        checkInDate: "",
        checkOutDate: "",
        guests: 1,
      },
      pageTitle: "Reserve Home",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postCreateBooking = async (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }

  const { homeId, checkInDate, checkOutDate, guests } = req.body;
  const home = await Home.findById(homeId);

  if (!home) return res.redirect("/homes");

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const guestsCount = Number(guests);
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const nights = Math.ceil((checkOut - checkIn) / oneDayInMs);

  const errors = [];
  if (!checkInDate || !checkOutDate || Number.isNaN(nights) || nights <= 0) {
    errors.push("Please select valid check-in and check-out dates.");
  }
  if (Number.isNaN(guestsCount) || guestsCount < 1 || guestsCount > 20) {
    errors.push("Guests should be between 1 and 20.");
  }

  if (errors.length > 0) {
    return res.status(422).render("store/reserve", {
      home,
      errors,
      oldInput: { checkInDate, checkOutDate, guests: guestsCount || 1 },
      pageTitle: "Reserve Home",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }

  const overlappingBooking = await Booking.findOne({
    home: homeId,
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  });

  if (overlappingBooking) {
    return res.status(409).render("store/reserve", {
      home,
      errors: ["This home is already booked for the selected dates."],
      oldInput: { checkInDate, checkOutDate, guests: guestsCount },
      pageTitle: "Reserve Home",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  }

  const booking = new Booking({
    user: req.session.user._id,
    home: homeId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    guests: guestsCount,
    totalPrice: nights * home.price,
  });

  await booking.save();
  res.redirect("/bookings");
};

exports.postCancelBooking = async (req, res, next) => {
  if (!req.isLoggedIn || !req.session.user) {
    return res.redirect("/login");
  }

  const bookingId = req.params.bookingId;
  const userId = req.session.user._id;

  await Booking.deleteOne({ _id: bookingId, user: userId });
  res.redirect("/bookings");
};

exports.getHouseRules = (req, res, next) => {
  const homeId = req.params.homeId;
  
  Home.findById(homeId).then(home => {
    if (!home || !home.houseRules) {
      return res.redirect('/homes');
    }
    
    // home.houseRules should store the "randomString-filename.pdf"
    const filePath = path.join(rootDir, 'rules', home.houseRules);
    res.download(filePath, 'House-Rules.pdf'); 
  }).catch(err => next(err));
};