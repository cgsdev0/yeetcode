var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
var passport = require("passport");
var twitchStrategy = require("passport-twitch-new").Strategy;

var app = express();
var expressWs = require("express-ws")(app);

let db = {
  users: {},
  handles: {},
  admins: ["56931496"],
  players: new Set(),
};

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({ secret: process.env.VITE_COOKIE_SECRET }));
// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("./public"));

passport.use(
  new twitchStrategy(
    {
      clientID: process.env.VITE_TWITCH_CLIENT_ID,
      clientSecret: process.env.VITE_TWITCH_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/callback",
      scope: "user_read",
    },
    function (accessToken, refreshToken, profile, done) {
      db.users[profile.id] = { ...profile, connected: false, done: false };
      if (db.admins.includes(profile.id)) {
        db.players.add(profile.id);
      }
      done(null, profile);
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get("/", function (req, res) {
  res.write(JSON.stringify(req.session));
  res.end();
});

app.get("/advance", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) res.end();
  // TODO: set new problem
  broadcast(JSON.stringify(getState()));
});
app.get("/approve/:id", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) res.end();
  const approved = req.params.id;
  db.players.add(approved);
  broadcast();
});
app.get("/admin", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) res.end();
  let html = [
    "<h1>Start New Round</h1>",
    "<a href='/advance' target='_blank'>New Round</a>",
    "<h1>Approve Players</h1>",
  ];
  Object.values(db.users).forEach((u) => {
    if (!db.players.includes(u)) {
      html.push(
        `<a target='_blank' href="/approve/${u.id}">Approve ${u.display_name}</a>`,
      );
    }
  });
  res.header("content-type", "text/html");
  res.write(html.join("\n"));
  res.end();
});

const getState = () => {
  let resp = [];
  db.players.forEach((k) => {
    resp.push(db.users[k]);
  });
  resp.sort((a, b) => a.id > b.id);
  return { players: resp, type: "world" };
};

const broadcast = (data) => {
  Object.values(db.handles).forEach((handle) => {
    handle.send(data);
  });
};

app.ws("/ws", function (ws, req) {
  const id = req.session?.passport?.user?.id;
  if (id && db.users.hasOwnProperty(id)) {
    db.users[id].connected = true;
    db.handles[id] = ws;
    broadcast(JSON.stringify(getState()));
    ws.on("message", function (msg) {
      ws.send(msg);
    });
  } else {
    ws.close();
  }
  ws.on("close", function () {
    const id = req.session?.passport?.user?.id;
    if (id && db.users.hasOwnProperty(id)) {
      db.users[id].connected = false;
      delete db.handles[id];
    }
  });
});

app.get("/auth/twitch", passport.authenticate("twitch"));
app.get(
  "/callback",
  passport.authenticate("twitch", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
    res.end();
  },
);

app.listen(8000);
