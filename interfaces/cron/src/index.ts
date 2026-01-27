import cron from "node-cron";
import { accountFactory as accountFactoryMongo } from "@infrastructure/adapters/db/mongo/factories/account";
import { accountFactory as accountFactoryMysql } from "@infrastructure/adapters/db/mysql/factories/account";
import { creditFactory } from "@infrastructure/adapters/db/mysql/factories/credit";

console.log("🕐 Cron service starting...");

cron.schedule("0 2 1 * *", async () => {
  console.log("💰 Monthly credit payments - Starting");
  try {
    const result = await creditFactory().applyMonthlyPaiementCredit.execute();
    if (!(result instanceof Error)) {
      console.log(`✅ Processed ${result.successful} credit accounts`);
    } else {
      console.error("❌ Credit payment failed:", result);
    }
  } catch (error) {
    console.error("❌ Credit payment error:", error);
  }
});

cron.schedule("0 2 * * *", async () => {
  console.log("💵 Monthly savings interest - Starting");
  try {
    const result =
      await accountFactoryMysql().admin.applyDailyInterest.execute();
    if (result instanceof Error) {
      throw new Error("Failed to get interest rate");
    } else {
      console.error("❌ Savings interest failed:", result);
    }
  } catch (error) {
    console.error("❌ Savings interest error:", error);
  }
});

console.log("✅ Cron jobs scheduled");

// Garder le process vivant
process.on("SIGINT", () => {
  console.log("🛑 Cron service stopping...");
  process.exit(0);
});
