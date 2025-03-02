import cron from "node-cron";
import { BlockfrostService } from "./services/blockfrost";

export function startBackgroundServices() {
  const preprodService = new BlockfrostService("preprod");
  const mainnetService = new BlockfrostService("mainnet");

  async function fetchData() {
    console.log("[Background Service] Starting blockchain data fetch...");
    try {
      // First fetch preprod data
      console.log("[Background Service] Fetching Preprod network data...");
      await Promise.all([
        preprodService.fetchLatestTransactions().catch(error => {
          console.error("[Background Service] Error fetching preprod transactions:", error);
        }),
        preprodService.fetchLatestAssets().catch(error => {
          console.error("[Background Service] Error fetching preprod assets:", error);
        })
      ]);

      // Then fetch mainnet data
      console.log("[Background Service] Fetching Mainnet network data...");
      await Promise.all([
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

  // Schedule data fetch every 5 minutes
  cron.schedule("*/5 * * * *", fetchData);

  // Initial fetch on startup
  console.log("[Background Service] Running initial data fetch...");
  fetchData().catch(console.error);
}