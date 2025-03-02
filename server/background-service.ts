import cron from "node-cron";
import { BlockfrostService } from "./services/blockfrost";

export function startBackgroundServices() {
  const preprodService = new BlockfrostService("preprod");
  const mainnetService = new BlockfrostService("mainnet");

  async function fetchData() {
    console.log("[Background Service] Starting blockchain data fetch...");

    try {
      // Fetch Preprod network data
      console.log("[Background Service] Fetching Preprod network data...");
      await preprodService.fetchLatestTransactions().catch(error => {
        console.error("[Background Service] Error fetching preprod transactions:", error);
      });

      await preprodService.fetchLatestAssets().catch(error => {
        console.error("[Background Service] Error fetching preprod assets:", error);
      });

      console.log("[Background Service] Completed Preprod data fetch");

      // Fetch Mainnet network data
      console.log("[Background Service] Fetching Mainnet network data...");
      await mainnetService.fetchLatestTransactions().catch(error => {
        console.error("[Background Service] Error fetching mainnet transactions:", error);
      });

      await mainnetService.fetchLatestAssets().catch(error => {
        console.error("[Background Service] Error fetching mainnet assets:", error);
      });

      console.log("[Background Service] Completed Mainnet data fetch");
    } catch (error) {
      console.error("[Background Service] Error in blockchain data fetch:", error);
    }
  }

  // Schedule data fetch every 5 minutes
  cron.schedule("*/5 * * * *", fetchData);

  // Run initial fetch immediately on startup
  console.log("[Background Service] Running initial data fetch...");
  fetchData().catch(console.error);
}