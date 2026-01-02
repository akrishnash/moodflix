import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try multiple possible paths for the built client
  const possiblePaths = [
    path.resolve(__dirname, "public"),           // dist/public when running from dist/
    path.resolve(__dirname, "../dist/public"),   // dist/public from server root
    path.resolve(process.cwd(), "dist/public"),  // dist/public from app root
  ];
  
  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      console.log(`Found static files at: ${distPath}`);
      break;
    }
  }
  
  if (!distPath) {
    console.error(`Could not find static files. Tried: ${possiblePaths.join(", ")}`);
    console.error(`Current __dirname: ${__dirname}`);
    console.error(`Current cwd: ${process.cwd()}`);
    // Don't throw - just log error and continue (app will still work for API)
    app.get("*", (_req, res) => {
      res.status(500).send("Static files not found. Check build process.");
    });
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
