import cron from "node-cron";
import { BlockfrostService } from "./services/blockfrost";

export function startBackgroundServices() {
  const preprodService = new BlockfrostService("preprod");

  // Schedule transaction and asset fetching every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("Starting scheduled blockchain data fetch...");
    try {
      await Promise.all([
        preprodService.fetchLatestTransactions(),
        preprodService.fetchLatestAssets()
      ]);
      console.log("Completed scheduled blockchain data fetch");
    } catch (error) {
      console.error("Error in scheduled blockchain data fetch:", error);
    }
  });

  // Initial fetch on startup
  Promise.all([
    preprodService.fetchLatestTransactions(),
    preprodService.fetchLatestAssets()
  ]).catch(console.error);
}