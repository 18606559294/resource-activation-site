// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 记录下载日志
      const log = {
        timestamp: new Date().toISOString(),
        ...req.body,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };

      // 这里可以添加日志记录逻辑，比如写入文件或发送到日志服务
      console.log('Download Log:', log);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    // 处理下载请求
    res.status(200).json({
      success: true,
      message: 'Please use cloud storage links'
    });
  }
}
