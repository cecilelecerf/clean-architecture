import cron from "node-cron";
import { accountFactory as accountFactoryMongo } from "@infrastructure/adapters/db/mongo/factories/account";
import { accountFactory as accountFactoryMysql } from "@infrastructure/adapters/db/mysql/factories/account";
import { creditFactory } from "@infrastructure/adapters/db/mysql/factories/credit";

export function setupCronJobs() {
  //   cron.schedule("0 2 * * *", async () => {
  //     console.log(
  //       `[${new Date().toISOString()}] Running daily interest calculation...`
  //     );

  //     try {
  //       const result =
  //         await accountFactoryMongo().admin.applyDailyInterest.execute();
  //       if (result instanceof Error) {
  //         throw new Error("Failed to get interest rate");
  //       }

  //       console.log(`✅ Interest applied to ${result.distributed} accounts`);
  //     } catch (error) {
  //       console.error("❌ Cron job error:", error);
  //     }
  //   });
  cron.schedule("0 2 * * *", async () => {
    console.log(
      `[${new Date().toISOString()}] Running daily interest calculation...`
    );

    try {
      const result =
        await accountFactoryMysql().admin.applyDailyInterest.execute();
      if (result instanceof Error) {
        throw new Error("Failed to get interest rate");
      }

      console.log(`✅ Interest applied to ${result.distributed} accounts`);
    } catch (error) {
      console.error("❌ Cron job error:", error);
    }
  });
  cron.schedule("0 0 1 * *", async () => {
    console.log("Test cron - every minute");
    try {
      const result = await creditFactory().applyMonthlyPaiementCredit.execute();
      if (!(result instanceof Error)) {
        console.log(`✅ Test: ${result.successful} accounts`);
      }
    } catch (error) {
      console.error("❌ Test error:", error);
    }
  });

  // Pour le développement : exécuter toutes les minutes (commenté)
  // cron.schedule("* * * * *", async () => {
  //   console.log("Test cron - every minute");
  //   try {
  //     const result =
  //       await accountFactoryMysql().admin.applyDailyInterest.execute();
  //     if (!(result instanceof Error)) {
  //       console.log(`✅ Test: ${result.distributed} accounts`);
  //     }
  //   } catch (error) {
  //     console.error("❌ Test error:", error);
  //   }
  // });

  // Pour le développement : exécuter toutes les minutes (commenté)
  // cron.schedule("* * * * *", async () => {
  //   console.log("Test cron - every minute");
  //   try {
  //     const result = await creditFactory().applyMonthlyPaiementCredit.execute();
  //     if (!(result instanceof Error)) {
  //       console.log(`✅ Test: ${result.successful} accounts`);
  //     }
  //   } catch (error) {
  //     console.error("❌ Test error:", error);
  //   }
  // });
  console.log("✅ Cron jobs scheduled");
}
