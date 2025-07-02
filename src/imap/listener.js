import { ImapFlow } from "imapflow";

/**
 * IMAP邮件监听器
 * @param {Object} config - IMAP配置
 * @param {string} config.host - IMAP服务器地址
 * @param {number} config.port - IMAP端口
 * @param {string} config.user - 邮箱账号
 * @param {string} config.password - 邮箱密码
 * @param {boolean} [config.tls=true] - 是否使用TLS
 */
/**
 * 获取最新一封邮件
 * @param {Object} config - IMAP配置
 * @returns {Promise<Object>} 邮件信息对象
 */
export async function getLatestMail(config) {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.tls !== false,
    auth: {
      user: config.user,
      pass: config.password,
    },
    logger: false,
  });

  try {
    await client.connect();
    console.log("IMAP连接成功");

    const lock = await client.getMailboxLock("INBOX");
    try {
      // 获取最新3封邮件
      const messages = await client.fetch("*", {
        envelope: true,
        source: true,
        limit: 3,
        sort: [{ field: "date", reverse: true }],
      });

      const latestMails = [];
      for await (const message of messages) {
        latestMails.push({
          subject: message.envelope.subject,
          from: message.envelope.from[0].address,
          date: message.envelope.date,
          text: message.source.toString("utf8"),
        });
      }

      return latestMails;
    } finally {
      lock.release();
      await client.logout();
    }
  } catch (err) {
    console.error("IMAP错误:", err);
    throw err;
  }
}
