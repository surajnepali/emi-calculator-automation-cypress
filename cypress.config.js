const { defineConfig } = require("cypress");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: true,

  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/reports",
    overwrite: false,
    html: true,
    json: true,
    charts: true,
    reportPageTitle: "EMI Automation Report",
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  e2e: {
    downloadsFolder: "cypress/downloads",

    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // 🔹 Load dynamic environment file
      // Usage:
      // CYPRESS_ENV=test npx cypress run
      // CYPRESS_ENV=qa npx cypress run

      const environment = process.env.CYPRESS_ENV || "test";
      const envFile = `.env.${environment}`;
      const envPath = path.resolve(__dirname, envFile);

      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`Loaded environment file: ${envFile}`);
      } else {
        console.warn(`Environment file "${envFile}" not found.`);
      }

      // 🔹 Merge system env variables into Cypress env
      config.env = {
        ...config.env,
        ...process.env,
      };

      // 🔹 Proper baseUrl assignment (IMPORTANT FIX)
      config.baseUrl = process.env.BASE_URL || config.baseUrl;

      // 🔹 Tasks
      on("task", {
        getLatestFile(folderPath) {
          try {
            const files = fs.readdirSync(folderPath);
            if (!files.length) return null;

            const latestFile = files
              .map((file) => ({
                name: file,
                time: fs.statSync(path.join(folderPath, file)).mtime.getTime(),
              }))
              .sort((a, b) => b.time - a.time)[0].name;

            return latestFile;
          } catch (err) {
            throw new Error(`Error reading folder: ${err.message}`);
          }
        },

        deleteDownloadsFolder() {
          try {
            const downloadsFolder = path.resolve(
              __dirname,
              "cypress/downloads",
            );
            if (fs.existsSync(downloadsFolder)) {
              fs.rmSync(downloadsFolder, { recursive: true, force: true });
              console.log("Downloads folder deleted successfully");
            }
            return null;
          } catch (err) {
            throw new Error(
              `Failed to delete downloads folder: ${err.message}`,
            );
          }
        },

        readXlsxFile({ filePath, sheetName }) {
          try {
            const workbook = xlsx.readFile(filePath);
            const targetSheet =
              workbook.Sheets[sheetName] ||
              workbook.Sheets[workbook.SheetNames[0]];

            const data = xlsx.utils.sheet_to_json(targetSheet, { defval: "" });
            return data;
          } catch (error) {
            throw new Error(`Failed to read XLSX file: ${error.message}`);
          }
        },
      });

      console.log("Final baseUrl:", config.baseUrl);
      console.log("Final Cypress env:", config.env);

      return config;
    },
  },
});
