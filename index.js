import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import "dotenv/config";

const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT),
  secure: process.env.IMAP_TLS === "true",
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASSWORD,
  },
  logger: false,
});

async function getLatestEmail() {
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX");

    // 获取最新未读邮件
    const messages = await client.fetchOne("*", {
      envelope: true,
      bodyStructure: true,
      source: true,
      flags: true,
    });

    console.log("最新邮件信息:");
    console.log("发件人:", messages.envelope.from[0].address);
    console.log(
      "收件人:",
      messages.envelope.to.map((t) => t.address).join(", ")
    );
    console.log("主题:", messages.envelope.subject);
    console.log("日期:", messages.envelope.date);

    // 解析邮件正文
    const simpleParser = await import("mailparser").then((m) => m.simpleParser);
    const parsed = await simpleParser(messages.source);

    console.log("正文文本:", parsed.text);
    console.log("正文HTML:", parsed.html);
    console.log("附件数量:", parsed.attachments.length);
  } catch (err) {
    console.error("获取邮件失败:", err);
  } finally {
    await client.logout();
  }
}

getLatestEmail();
