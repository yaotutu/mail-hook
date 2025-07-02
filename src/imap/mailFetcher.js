import { createImapClient } from "./client.js";
import { processMail } from "../mail/mailProcessor.js";

/**
 * 获取最新邮件
 * @param {Object} config - IMAP配置
 * @param {number} [limit=3] - 要获取的邮件数量
 * @returns {Promise<Array>} 处理后的邮件数组
 */
export async function fetchLatestMails(config, limit = 3) {
  const client = await createImapClient(config);

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const messages = await client.fetch("*", {
        envelope: true,
        source: true,
        limit,
        sort: [{ field: "date", reverse: true }],
      });

      const mails = [];
      for await (const message of messages) {
        mails.push(await processMail(message));
      }
      return mails;
    } finally {
      lock.release();
      await client.logout();
    }
  } catch (err) {
    console.error("获取邮件失败:", err);
    throw err;
  }
}
