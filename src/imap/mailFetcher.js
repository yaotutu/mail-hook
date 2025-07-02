import { createImapClient } from "./client.js";
import { simpleParser } from "mailparser";

/**
 * 解析邮件内容
 * @param {Buffer} source - 邮件原始数据
 * @returns {Promise<string>} 解析后的正文内容
 */
async function parseEmailContent(source) {
  try {
    const parsed = await simpleParser(source);
    return parsed.text || parsed.html || "无正文内容";
  } catch (err) {
    console.error("邮件解析失败:", err);
    return source.toString("utf8");
  }
}

/**
 * 获取最新邮件
 * @param {Object} config - IMAP配置
 * @param {number} [limit=3] - 要获取的邮件数量
 * @returns {Promise<Array>} 邮件数组
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
        mails.push({
          subject: message.envelope.subject,
          from: message.envelope.from[0].address,
          date: message.envelope.date,
          text: await parseEmailContent(message.source),
        });
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
