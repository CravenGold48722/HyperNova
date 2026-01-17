import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createBareServer } from "@nebula-services/bare-server-node";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import basicAuth from "express-basic-auth";
import mime from "mime";
import fetch from "node-fetch";
import config from "./config.js";

console.log(chalk.yellow("Starting server..."));

const __dirname = process.cwd();
const server = http.createServer();
const app = express();
const bareServer = createBareServer("/ca/");
const PORT = process.env.PORT || 8080;
const cache = new Map();
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

/* ======================================================
   MERGED FETCH FUNCTION (from your standalone script)
====================================================== */

const targetUrl = "https://google.com";
const customReferer = "https://classroom.google.com/";

async function makeRequest() {
  console.log("=== Sending Request ===");
  console.log(`Target URL: ${targetUrl}`);
  console.log(`Custom Referer: ${customReferer}`);
  console.log("=======================\n");

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Referer: customReferer,
      "User-Agent": "Node.js Custom Client"
    }
  });

  const text = await response.text();

  return {
    status: response.status,
    statusText: response.statusText,
    preview: text.substring(0, 500)
  };
}

/* Optional route to trigger the request */
app.get("/test-fetch", async (_req, res) => {
  try {
    const result = await makeRequest();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   AUTH / MIDDLEWARE
====================================================== */

if (config.challenge !== false) {
  console.log(chalk.green("Password protection is enabled"));
  app.use(basicAuth({ users: config.users, challenge: true }));
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use("/ca", cors({ origin: true }));

/* ======================================================
   ASSET ROUTE WITH CACHE
====================================================== */

app.get("/e/*", async (req, res, next) => {
  try {
    if (cache.has(req.path)) {
      const { data, contentType, timestamp } = cache.get(req.path);
      if (Date.now() - timestamp <= CACHE_TTL) {
        res.writeHead(200, { "Content-Type": contentType });
        return res.end(data);
      }
      cache.delete(req.path);
    }

    const baseUrls = {
      "/e/1/": "https://raw.githubusercontent.com/qrs/x/fixy/",
      "/e/2/": "https://raw.githubusercontent.com/3v1/V5-Assets/main/",
      "/e/3/": "https://raw.githubusercontent.com/3v1/V5-Retro/master/"
    };

    let reqTarget;
    for (const [prefix, baseUrl] of Object.entries(baseUrls)) {
      if (req.path.startsWith(prefix)) {
        reqTarget = baseUrl + req.path.slice(prefix.length);
        break;
      }
    }

    if (!reqTarget) return next();

    const asset = await fetch(reqTarget);
    if (!asset.ok) return next();

    const data = Buffer.from(await asset.arrayBuffer());
    const ext = path.extname(reqTarget);
    const contentType =
      ext === ".unityweb" ? "application/octet-stream" : mime.getType(ext);

    cache.set(req.path, { data, contentType, timestamp: Date.now() });
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.status(500).send("Error fetching the asset");
  }
});

/* ======================================================
   STATIC ROUTES
====================================================== */

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

[
  { path: "/b", file: "apps.html" },
  { path: "/a", file: "games.html" },
  { path: "/play.html", file: "games.html" },
  { path: "/c", file: "settings.html" },
  { path: "/d", file: "tabs.html" }
].forEach(route => {
  app.get(route.path, (_req, res) => {
    res.sendFile(path.join(__dirname, "static", route.file));
  });
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "static", "404.html"));
});

/* ======================================================
   SERVER / BARE
====================================================== */

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
  console.log(chalk.green(`Server running at http://localhost:${PORT}`));
});
