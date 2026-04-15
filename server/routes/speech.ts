import { Router } from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 限制
});

router.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    const token = process.env.API_TOKEN;
    
    if (!token) {
      return res.status(500).json({ 
        success: false, 
        error: '未配置语音识别服务令牌' 
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: '未收到音频文件' 
      });
    }

    // 将 webm 格式映射为 ogg（编码兼容）
    let filename = req.file.originalname || 'audio.ogg';
    let contentType = req.file.mimetype;

    if (contentType.includes('webm')) {
      filename = filename.replace(/\.webm$/i, '.ogg');
      contentType = 'audio/ogg';
    }

    // 构建 FormData 转发给扣子 API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename,
      contentType,
    });

    // 添加详细日志
    console.log('[Speech API] Uploading audio:', {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      mappedFilename: filename,
      mappedContentType: contentType,
    });

    // 添加超时保护
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15秒超时

    try {
      const response = await fetch('https://api.coze.cn/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders(),
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const result = await response.json() as {
        code?: number;
        msg?: string;
        data?: {
          text?: string;
        };
      };

      // 添加详细日志
      console.log('[Speech API] Coze response:', JSON.stringify(result));

      if (result.code === 0) {
        res.json({ 
          success: true, 
          text: result.data?.text || '' 
        });
      } else {
        console.error('Coze API error:', result);
        res.status(500).json({ 
          success: false, 
          error: result.msg || '语音识别失败' 
        });
      }
    } catch (error) {
      clearTimeout(timeout);
      if ((error as Error).name === 'AbortError') {
        return res.status(504).json({ success: false, error: '语音识别超时，请重试' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Speech to text error:', error);
    res.status(500).json({ 
      success: false, 
      error: '语音识别服务异常' 
    });
  }
});

export default router;
