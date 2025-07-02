import { fetchLatestMails } from "./src/imap/mailFetcher.js";
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
    const mails = await fetchLatestMails(config);
    if (mails.length > 0) {
      mails.forEach((mail, index) => {
        console.log(`\n邮件 ${index + 1}:`);
        console.log("主题:", mail.subject);
        console.log("发件人:", mail.from);
        console.log("日期:", mail.date);
        console.log("正文:");
        // 格式化显示正文，移除多余空行和缩进
        const cleanText = mail.text
          .replace(/[\r\n]+/g, "\n") // 合并多余换行
          .replace(/^[ \t]+/gm, "") // 移除行首空格
          .trim();

        // 显示前200字符，保留完整最后一行
        const preview =
          cleanText.length > 200
            ? cleanText.substring(0, 200).replace(/\n[^\n]*$/, "") + "..."
            : cleanText;
        console.log(preview);
      });
    } else {
      console.log("收件箱中没有邮件");
    }
  } catch (err) {
    console.error("获取邮件失败:", err);
  }
})();
