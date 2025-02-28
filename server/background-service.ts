import cron from "node-cron";
import { BlockfrostService } from "./services/blockfrost";

export function startBackgroundServices() {
  const preprodService = new BlockfrostService("preprod");

  async function fetchData() {
    console.log("[Background Service] Starting blockchain data fetch...");
    try {
      await Promise.all([
        preprodService.fetchLatestTransactions().catch(error => {
          console.error("[Background Service] Error fetching transactions:", error);
        }),
        preprodService.fetchLatestAssets().catch(error => {
          console.error("[Background Service] Error fetching assets:", error);
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