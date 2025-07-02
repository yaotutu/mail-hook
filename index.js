import { getLatestMail } from "./src/imap/listener.js";
import "dotenv/config";

const config = {
  host: process.env.IMAP_HOST || "imap.163.com",
  port: process.env.IMAP_PORT || 993,
  user: process.env.MAIL_USER || process.env.IMAP_USER,
  password: process.env.MAIL_PASS || process.env.IMAP_PASSWORD,
  tls: process.env.IMAP_TLS !== "false",
};

if (!config.user || !config.password) {
  console.error("请设置MAIL_USER和MAIL_PASS环境变量");
  process.exit(1);
}

(async () => {
  try {
    console.log("正在获取最新3封邮件...");
    const mails = await getLatestMail(config);
    if (mails.length > 0) {
      mails.forEach((mail, index) => {
        console.log(`\n邮件 ${index + 1}:`);
        console.log("主题:", mail.subject);
        console.log("发件人:", mail.from);
        console.log("日期:", mail.date);
        console.log("正文预览:", mail.text.substring(0, 100) + "...");
      });
    } else {
      console.log("收件箱中没有邮件");
    }
  } catch (err) {
    console.error("获取邮件失败:", err);
  }
})();
