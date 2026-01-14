import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import basicAuth from "express-basic-auth";
import cookieParser from "cookie-parser";
import mime from "mime";
import chalk from "chalk";
import { createBareServer } from "@nebula-services/bare-server-node";
import config from "./config.js";

console.log(chalk.yellow("🚀 Starting server..."));

const __dirname = process.cwd();
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer();
const bareServer = createBareServer("/ca/");

if (config.challenge !== false) {
  console.log(chalk.green("🔒 Password protection is enabled"));
  Object.entries(config.users).forEach(([u, p]) =>
    console.log(chalk.blue(`User: ${u} | Pass: ${p}`))
  );
  app.use(basicAuth({ users: config.users, challenge: true }));
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/ca", cors({ origin: true }));

const cache = new Map();
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;
const BASE_URLS = {
  "/e/1/": "https://raw.githubusercontent.com/qrs/x/fixy/",
  "/e/2/": "https://raw.githubusercontent.com/3v1/V5-Assets/main/",
  "/e/3/": "https://raw.githubusercontent.com/3v1/V5-Retro/master/"
};

let fetch;
async function getFetch() {
  if (!fetch) {
    ({ default: fetch } = await import("node-fetch"));
  }
  return fetch;
}

// Proxy for external assets with caching
app.get("/e/*", async (req, res, next) => {
  try {
    const cached = cache.get(req.path);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      res.setHeader("Content-Type", cached.type);
      return res.end(cached.data);
    }

    let target;
    for (const [prefix, base] of Object.entries(BASE_URLS)) {
      if (req.path.startsWith(prefix)) {
        target = base + req.path.slice(prefix.length);
        break;
      }
    }
    if (!target) return next();

    const fetch = await getFetch();
    const r = await fetch(target);
    if (!r.ok) return next();

    const buf = Buffer.from(await r.arrayBuffer());
    const ext = path.extname(target);
    const type = ext === ".unityweb"
      ? "application/octet-stream"
      : mime.getType(ext) || "application/octet-stream";

    cache.set(req.path, {
      data: buf,
      type,
      time: Date.now()
    });

    res.setHeader("Content-Type", type);
    res.end(buf);
  } catch (e) {
    console.error("Asset error:", e);
    res.status(500).send("Asset fetch error");
  }
});

// Serve index.html as fast as possible
app.get("/", (req, res, next) => {
  try {
    const indexPath = path.join(__dirname, "static", "index.html");
    const stream = fs.createReadStream(indexPath);
    res.setHeader("Content-Type", "text/html");
    stream.pipe(res, { end: false });

    stream.on("data", () => {
      // First bytes sent — browser can start running JS immediately
      // Other server work continues in parallel
    });

    stream.on("end", () => res.end());
  } catch (err) {
    console.error(err);
    res.status(500).sendFile(path.join(__dirname, "static/404.html"));
  }
});

// Serve other static files normally
app.use(express.static(path.join(__dirname, "static"), { extensions: ["html"] }));

// Fallback routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "static/404.html"));
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).sendFile(path.join(__dirname, "static/404.html"));
});

// Bare server routing
server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(PORT, () => {
  console.log(chalk.green(`🌍 Server running on http://localhost:${PORT}`));
});
