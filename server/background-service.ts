import cron from "node-cron";
import { BlockfrostService } from "./services/blockfrost";

export function startBackgroundServices() {
  const preprodService = new BlockfrostService("preprod");

  // Schedule transaction fetching every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("Starting scheduled transaction fetch...");
    await preprodService.fetchLatestTransactions();
    console.log("Completed scheduled transaction fetch");
  });

  // Initial fetch on startup
  preprodService.fetchLatestTransactions().catch(console.error);
}
