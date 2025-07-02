import { simpleParser } from "mailparser";

/**
 * 处理邮件原始数据
 * @param {Object} mailData - 原始邮件数据
 * @returns {Promise<Object>} 处理后的邮件信息
 */
export async function processMail(mailData) {
  try {
    // 解析邮件内容
    const parsed = await simpleParser(mailData.source);

    return {
      subject: mailData.envelope.subject || "无主题",
      from: mailData.envelope.from?.[0]?.address || "未知发件人",
      date: mailData.envelope.date || new Date(),
      text: formatMailContent(parsed.text || parsed.html || "无正文内容"),
      raw: mailData.source,
    };
  } catch (err) {
    console.error("邮件处理失败:", err);
    return {
      ...mailData.envelope,
      text: formatMailContent(mailData.source.toString("utf8")),
      raw: mailData.source,
    };
  }
}

/**
 * 格式化邮件正文
 * @param {string} content - 原始邮件内容
 * @returns {string} 格式化后的内容
 */
function formatMailContent(content) {
  return content
    .replace(/[\r\n]+/g, "\n") // 合并多余换行
    .replace(/^[ \t]+/gm, "") // 移除行首空格
    .trim();
}
