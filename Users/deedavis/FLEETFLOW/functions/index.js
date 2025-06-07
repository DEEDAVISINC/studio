const functions = require("firebase-functions/v2");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, conf: { distDir: ".next" } }); // This will look for .next in the root
const handle = app.getRequestHandler();

// Ensure the exported function name matches what's in firebase.json rewrites
exports.nextApp = functions.https.onRequest(
  { region: "us-central1" }, // Add region if needed, and other options
  async (req, res) => {
    await app.prepare();
    return handle(req, res);
  }
);
