import request from "@/utils/request";

// 发送消息获取AI回复（普通模式，保留兼容）
export const sendMessageApi = (data) => {
  return request.post('/user/ai/consult', data);
};

// 流式发送消息获取AI回复（SSE模式）
export const sendMessageStreamApi = (question, sessionId, callbacks) => {
  const { onToken, onComplete, onError } = callbacks;

  // 构建URL参数
  const params = new URLSearchParams({
    question,
    sessionId
  });

  const token = JSON.parse(localStorage.getItem('loginUser') || '{}').token;

  fetch(`/api/user/ai/consult/stream?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream',
      ...(token ? { 'token': token } : {})
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    function processStream() {
      reader.read().then(({ done, value }) => {
        if (done) {
          console.log('[SSE] 流结束');
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('[SSE] 收到chunk:', chunk);
        buffer += chunk;

        // 按双换行分割事件（SSE 标准分隔符）
        const events = buffer.split('\n\n');
        // 保留最后一个可能不完整的事件
        buffer = events.pop() || '';

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          // 从事件块中提取 data 行
          const lines = eventBlock.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const data = trimmed.substring(5).trim();
              if (data) {
                try {
                  const event = JSON.parse(data);
                  console.log('[SSE] 解析事件:', event.type);
                  if (event.type === 'token' && onToken) {
                    onToken(event.content);
                  } else if (event.type === 'complete' && onComplete) {
                    onComplete(event);
                  } else if (event.type === 'error' && onError) {
                    onError(event.message);
                  }
                } catch (e) {
                  console.warn('[SSE] 解析JSON失败:', data, e);
                }
              }
            }
          }
        }

        processStream();
      }).catch(error => {
        console.error('[SSE] 读取流失败:', error);
        if (onError) {
          onError(error.message || '流式读取失败');
        }
      });
    }

    processStream();
  }).catch(error => {
    console.error('[SSE] 请求失败:', error);
    if (onError) {
      onError(error.message || '请求失败');
    }
  });
};

// 获取历史对话列表
export const getHistoryApi = () => {
  return request.get('/user/ai/history');
};

// 保存对话
export const saveChatApi = (data) => {
  return request.post('/ai/saveChat', data);
};

// 上传文件
export const uploadFileApi = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/ai/uploadFile', formData);
};

// 创建新会话
export const createSessionApi = (sessionId) => {
  return request.post('/user/ai/createSession', { sessionId });
};

// 获取历史对话详情
export const getChatDetailApi = (sessionId) => {
  return request.get('/user/ai/chatDetail', { params: { sessionId } });
};

// 删除会话
export const deleteSessionApi = (sessionId) => {
  return request.delete('/user/ai/deleteSession', { params: { sessionId } });
};

