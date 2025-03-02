import cron from "node-cron";
import { BlockfrostService } from "./services/blockfrost";

export function startBackgroundServices() {
  const preprodService = new BlockfrostService("preprod");
  const mainnetService = new BlockfrostService("mainnet");

  async function fetchData() {
    console.log("[Background Service] Starting blockchain data fetch...");
    try {
      await Promise.all([
        // Preprod network
        preprodService.fetchLatestTransactions().catch(error => {
          console.error("[Background Service] Error fetching preprod transactions:", error);
        }),
        preprodService.fetchLatestAssets().catch(error => {
          console.error("[Background Service] Error fetching preprod assets:", error);
        }),
        // Mainnet network
        mainnetService.fetchLatestTransactions().catch(error => {
          console.error("[Background Service] Error fetching mainnet transactions:", error);
        }),
        mainnetService.fetchLatestAssets().catch(error => {
          console.error("[Background Service] Error fetching mainnet assets:", error);
        })
      ]);
      console.log("[Background Service] Completed blockchain data fetch");
    } catch (error) {
      console.error("[Background Service] Error in scheduled blockchain data fetch:", error);
    }
  }

  // Schedule data fetch every 15 minutes
  cron.schedule("*/15 * * * *", fetchData);

  // Initial fetch on startup
  console.log("[Background Service] Running initial data fetch...");
  fetchData().catch(console.error);
}