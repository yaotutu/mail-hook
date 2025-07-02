import { ImapFlow } from "imapflow";

/**
 * 创建IMAP客户端
 * @param {Object} config - IMAP配置
 * @returns {Promise<ImapFlow>} 已连接的IMAP客户端
 */
export async function createImapClient(config) {
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

  await client.connect();
  return client;
}
