var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");
var passport = require("passport");
var twitchStrategy = require("passport-twitch-new").Strategy;

var app = express();
var expressWs = require("express-ws")(app);

let db = {
  users: {},
  handles: {},
  admins: ["56931496", "42089909"],
  players: new Set(),
  problem: 0,
};

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
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
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://code.badcop.live/api/callback"
          : "http://localhost:8000/api/callback",
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

app.get("/api/me", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (db.users.hasOwnProperty(id)) {
    res.write(JSON.stringify(req.session));
  } else {
    res.write("{}");
  }
  res.end();
});

const sabotages = [
  "ohgod",
  "barebones",
  "vars",
  "aesthetic",
  "swap",
  "outdent",
  "bigindent",
  "minify",
  "semicolon",
  "greek",
  "lightsout",
];

function randomSabotage() {
  return sabotages[Math.floor(Math.random() * sabotages.length)];
}

app.get("/api/sabotage", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) {
    res.end();
    return;
  }
  broadcast(JSON.stringify({ type: "sabotage", kind: randomSabotage() }));
  res.end();
});

app.get("/api/advance", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) {
    res.end();
    return;
  }
  db.problem++;

  db.players.forEach((k) => {
    db.users[k].done = false;
  });

  broadcast(JSON.stringify(getState()));
  res.end();
});

app.get("/api/approve/:id", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) {
    res.end();
    return;
  }
  const approved = req.params.id;
  db.players.add(approved);
  broadcast(JSON.stringify(getState()));
  res.end();
});
app.get("/api/admin", function (req, res) {
  const id = req.session?.passport?.user?.id;
  if (!db.admins.includes(id)) {
    res.end();
    return;
  }
  let html = [
    "<h1>Start New Round</h1>",
    "<a href='/api/advance' target='_blank'>New Round</a>",
    "<h1>Sabotage</h1>",
    "<a href='/api/sabotage' target='_blank'>SABOTAGE EVERYTHING</a>",
    "<h1>Approve Players</h1>",
  ];
  Object.values(db.users).forEach((u) => {
    if (!db.players.has(u.id)) {
      html.push(
        `<a target='_blank' href="/api/approve/${u.id}">Approve ${u.display_name}</a>`,
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
    if (db.users[k].display_name === "BuddysPizza") return;
    resp.push(db.users[k]);
  });
  resp.sort((a, b) => a.id > b.id);
  return { players: resp, type: "world", problem: db.problem };
};

const broadcast = (data) => {
  Object.values(db.handles).forEach((handle) => {
    handle.send(data);
  });
};

app.ws("/api/ws", function (ws, req) {
  const id = req.session?.passport?.user?.id;
  if (
    id &&
    db.users.hasOwnProperty(id) &&
    db.players.has(id) &&
    !db.handles.hasOwnProperty(id)
  ) {
    db.users[id].connected = true;
    db.handles[id] = ws;
    broadcast(JSON.stringify(getState()));
    ws.on("message", function (msg) {
      if (msg === "done") {
        if (!db.users[id].done) {
          db.users[id].done = true;
          broadcast(JSON.stringify(getState()));
        }
      }
    });
  } else {
    ws.close();
  }
  ws.on("close", function () {
    const id = req.session?.passport?.user?.id;
    if (id && db.users.hasOwnProperty(id) && db.players.has(id)) {
      db.users[id].connected = false;
      delete db.handles[id];
      broadcast(JSON.stringify(getState()));
    }
  });
});

app.get("/api/auth/twitch", passport.authenticate("twitch"));
app.get(
  "/api/callback",
  passport.authenticate("twitch", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    if (process.env.NODE_ENV === "production") {
      res.redirect("https://code.badcop.live/");
    } else {
      res.redirect("http://localhost:5173/");
    }
    res.end();
  },
);

app.listen(8000);
