<template>
  <div class="flex h-screen overflow-hidden bg-background font-sans text-text">
    <!-- 左侧功能栏 -->
    <div :id="'sidebar'" :class="['transition-all duration-300 ease-in-out', sidebarExpanded ? 'w-64' : 'w-16', 'bg-white border-r border-gray-200 flex flex-col shadow-sm']">
      <!-- 顶部品牌 -->
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h1 v-if="sidebarExpanded" class="text-xl font-serif font-bold text-primary transition-all duration-300">法律AI助手</h1>
        <button id="toggleSidebar" @click="toggleSidebar" class="text-gray-400 hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
          <i :class="['fa', sidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right', 'transition-transform duration-300']"></i>
        </button>
      </div>

      <!-- 功能菜单 -->
      <div class="p-4">
        <h2 v-if="sidebarExpanded" class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 transition-all duration-300">功能</h2>
        <div class="space-y-2">
          <div @click="goToHome" class="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-primary hover:shadow-sm">
            <i class="fa fa-home mr-3 text-lg transition-transform duration-300 hover:scale-110"></i>
            <span v-if="sidebarExpanded" class="sidebar-text transition-all duration-300">返回首页</span>
          </div>
          <div id="lawStudyBtn" @click="switchMode('study')" :class="['w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer', mode === 'study' ? 'bg-blue-50 text-primary shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-primary hover:shadow-sm']">
            <i class="fa fa-book mr-3 text-lg transition-transform duration-300 hover:rotate-12"></i>
            <span v-if="sidebarExpanded" class="sidebar-text transition-all duration-300">法律学习</span>
          </div>
          <div id="lawConsultBtn" @click="switchMode('consult')" :class="['w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer', mode === 'consult' ? 'bg-blue-50 text-primary shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-primary hover:shadow-sm']">
            <i class="fa fa-comments mr-3 text-lg transition-transform duration-300 hover:scale-110"></i>
            <span v-if="sidebarExpanded" class="sidebar-text transition-all duration-300">法律咨询</span>
          </div>
        </div>
      </div>

      <!-- 历史对话 -->
      <div class="flex-1 p-4">
        <div class="flex justify-between items-center mb-3">
          <h2 v-if="sidebarExpanded" class="text-sm font-medium text-gray-500 uppercase tracking-wider transition-all duration-300">历史对话</h2>
          <button @click="createNewChat" class="text-gray-400 hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
            <i class="fa fa-plus transition-transform duration-300 hover:rotate-90"></i>
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="(history, index) in chatHistoryList" :key="index" class="p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all duration-300 cursor-pointer hover:shadow-sm">
            <div v-if="sidebarExpanded" class="flex justify-between items-start">
              <h3 class="font-medium text-sm" @click="loadChatHistory(history.sessionId)">{{ history.title }}</h3>
              <div class="flex items-center">
                <span class="text-xs text-gray-400 mr-2">{{ history.time }}</span>
                <button @click.stop="deleteSession(history.sessionId, index)" class="text-gray-400 hover:text-red-500 transition-all duration-300 p-1 rounded-full hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
            <p v-if="sidebarExpanded" class="text-xs text-gray-500 mt-1 line-clamp-2" @click="loadChatHistory(history.sessionId)">{{ history.content }}</p>
          </div>
        </div>
      </div>

      <!-- 底部用户信息 (已隐藏) -->
      <!-- <div class="p-4 border-t border-gray-200">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
            <i class="fa fa-user"></i>
          </div>
          <div v-if="sidebarExpanded" class="ml-3 transition-all duration-300">
            <h3 class="text-sm font-medium">用户</h3>
            <p class="text-xs text-gray-500">普通用户</p>
          </div>
          <button class="ml-auto text-gray-400 hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
            <i class="fa fa-cog transition-transform duration-300 hover:rotate-180"></i>
          </button>
        </div>
      </div> -->
    </div>

    <!-- 右侧对话区域 -->
    <div class="flex-1 flex flex-col">
      <!-- 顶部标题 -->
      <div class="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-serif font-bold text-primary">{{ mode === 'study' ? '法律学习' : '法律咨询' }}</h2>
          <div class="flex space-x-3">
            <button class="text-gray-400 hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-gray-100 hover:shadow-md transform hover:scale-105">
              <i class="fa fa-ellipsis-v transition-transform duration-300 hover:rotate-90"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- AI形象区域 -->
      <div class="bg-white border-b border-gray-200 p-6 flex items-center justify-center">
        <div class="flex flex-col items-center">
          <div id="aiAvatar" class="w-36 h-36 mb-4 relative">
            <div class="absolute inset-0 bg-primary rounded-full opacity-10 animate-pulse"></div>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="relative z-10">
              <!-- 头部 -->
              <circle cx="50" cy="40" r="30" fill="#f0f0f0" stroke="#1E3A8A" stroke-width="2"/>
              <!-- 眼睛 -->
              <circle cx="40" cy="35" r="5" fill="#1E3A8A"/>
              <circle cx="60" cy="35" r="5" fill="#1E3A8A"/>
              <!-- 嘴巴 -->
              <path d="M40 50 Q50 60 60 50" stroke="#1E3A8A" stroke-width="2" fill="none"/>
              <!-- 身体 -->
              <rect x="35" y="70" width="30" height="20" fill="#1E3A8A" rx="5"/>
              <!-- 手臂 -->
              <rect x="25" y="70" width="10" height="15" fill="#1E3A8A" rx="2"/>
              <rect x="65" y="70" width="10" height="15" fill="#1E3A8A" rx="2"/>
            </svg>
          </div>
          <div class="text-center">
            <h3 class="font-medium text-primary text-lg">法律智能助手</h3>
            <p class="text-sm text-gray-500 mt-1">专业法律知识，实时解答</p>
            <!-- 暂时注释掉语音按钮 -->
            <!-- <button id="voiceButton" @click="toggleVoiceMode" class="mt-2 text-primary hover:text-secondary transition-smooth" :title="voiceEnabled ? '关闭语音模式' : '语音模式'">
              <i :class="['fa', voiceEnabled ? 'fa-volume-off' : 'fa-volume-up']"></i>
            </button> -->
          </div>
        </div>
      </div>

      <!-- 对话历史 -->
      <div id="chatHistory" class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-gray-50">
        <div v-for="(message, index) in messages" :key="index" :class="['flex items-start', message.type === 'user' ? 'justify-end' : '']">
          <div v-if="message.type === 'ai'" class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
            <i class="fa fa-robot"></i>
          </div>
          <div v-if="message.type === 'user'" class="mr-4 max-w-[80%]">
            <div class="bg-primary text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300">
              <p>{{ message.content }}</p>
            </div>
            <div class="text-xs text-gray-500 mt-1 text-right">{{ message.time }}</div>
          </div>
          <div v-if="message.type === 'ai'" class="ml-4 max-w-[80%]">
            <div class="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <p class="text-gray-800" v-html="message.content.replace(/\r?\n/g, '<br>')"></p>
              <!-- 数据卡片展示 -->
              <div v-if="message.dataCards && message.dataCards.length > 0" class="mt-4 space-y-3">
                <div v-for="(card, cardIndex) in message.dataCards" :key="cardIndex" class="border border-gray-200 rounded-lg p-3 bg-blue-50 hover:bg-blue-100 transition-all duration-300 cursor-pointer" @click="navigateToDetail(card)">
                  <div v-if="card.type === 'law_article'" class="">
                    <h4 class="font-medium text-primary">{{ card.lawArticle.bookTitle }} - {{ card.lawArticle.articleTitle }}</h4>
                    <p class="text-sm text-gray-700 mt-2">{{ card.lawArticle.content }}</p>
                    <div class="text-xs text-gray-500 mt-2 flex justify-between">
                      <span>发布日期: {{ formatDate(card.lawArticle.publishDate) }}</span>
                      <span>生效日期: {{ formatDate(card.lawArticle.effectiveDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ message.time }}</div>
          </div>
          <div v-if="message.type === 'user'" class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 shadow-sm">
            <i class="fa fa-user"></i>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="bg-white border-t border-gray-200 p-6 shadow-sm">
        <div class="relative w-full">
          <div class="flex items-center w-full">
            <input 
              type="text" 
              id="userInput" 
              v-model="userInput" 
              placeholder="请输入您的法律问题..." 
              class="flex-1 border-2 border-primary rounded-full px-6 py-6 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base"
              @keypress.enter="sendMessage"
            >
            <button id="sendButton" @click="sendMessage" class="ml-3 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-secondary transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
              <i class="fa fa-paper-plane"></i>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { sendMessageApi, getHistoryApi, saveChatApi, uploadFileApi, createSessionApi, getChatDetailApi, deleteSessionApi } from '@/api/ai';

const router = useRouter();

// 响应式数据
const sidebarExpanded = ref(true);
const mode = ref('consult'); // study 或 consult
const userInput = ref('');
const sessionId = ref('');
const messages = ref([
  {
    type: 'ai',
    content: '您好！我是法律智能助手，很高兴为您提供法律咨询服务。请问有什么法律问题需要帮助？',
    time: '09:00'
  }
]);
const chatHistoryList = ref([
  {
    title: '劳动合同问题',
    time: '今天 09:00',
    content: '关于劳动合同解除的相关法律规定...'
  },
  {
    title: '离婚财产分割',
    time: '昨天 14:30',
    content: '离婚时财产如何分割...'
  },
  {
    title: '交通事故责任',
    time: '3天前',
    content: '交通事故责任如何认定...'
  },
  {
    title: '合同纠纷',
    time: '1周前',
    content: '合同纠纷如何处理...'
  }
]);
// 暂时注释掉语音相关功能
// const voiceEnabled = ref(false);
// const isSpeaking = ref(false);

// 方法
const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
};

const switchMode = (newMode) => {
  mode.value = newMode;
};

const sendMessage = async () => {
  const message = userInput.value.trim();
  if (message) {
    // 添加用户消息
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    messages.value.push({
      type: 'user',
      content: message,
      time
    });
    userInput.value = '';
    
    // 调用API获取AI回复
    try {
      console.log('发送消息前的sessionId:', sessionId.value);
      const response = await sendMessageApi({
        sessionId: sessionId.value,
        question: message
      });
      console.log('API响应:', response);
      
      // 添加AI回复
      const aiNow = new Date();
      const aiTime = aiNow.getHours().toString().padStart(2, '0') + ':' + aiNow.getMinutes().toString().padStart(2, '0');
      console.log('准备添加AI回复:', response.data.answer);
      messages.value.push({
        type: 'ai',
        content: response.data.answer || '无回复内容',
        time: aiTime,
        dataCards: response.data.data_cards || []
      });
      console.log('消息添加后:', messages.value);
      
      // 滚动到最新消息
      setTimeout(() => {
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }, 100);
      
      // 暂时注释掉语音相关功能
      // 如果语音模式开启，朗读回复内容
      // if (voiceEnabled.value && 'speechSynthesis' in window) {
      //   speakText(response.data.reply);
      // }
    } catch (error) {
      console.error('发送消息失败:', error);
      // 添加错误回复
      const errorNow = new Date();
      const errorTime = errorNow.getHours().toString().padStart(2, '0') + ':' + errorNow.getMinutes().toString().padStart(2, '0');
      messages.value.push({
        type: 'ai',
        content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
        time: errorTime
      });
      
      // 滚动到最新消息
      setTimeout(() => {
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }, 100);
    }
  }
};

const clearChat = () => {
  messages.value = [
    {
      type: 'ai',
      content: '您好！我是法律智能助手，很高兴为您提供法律咨询服务。请问有什么法律问题需要帮助？',
      time: '09:00'
    }
  ];
};

// 暂时注释掉语音相关功能
// const toggleVoiceMode = () => {
//   if ('speechSynthesis' in window) {
//     voiceEnabled.value = !voiceEnabled.value;
//     const message = voiceEnabled.value ? '语音模式已开启，我将为您朗读回复内容。' : '语音模式已关闭。';
//     speakText(message);
//   } else {
//     alert('您的浏览器不支持语音合成功能');
//   }
// };

// const speakText = (text) => {
//   isSpeaking.value = true;
//   const utterance = new SpeechSynthesisUtterance(text);
//   utterance.lang = 'zh-CN';
//   utterance.onend = () => {
//     isSpeaking.value = false;
//   };
//   speechSynthesis.speak(utterance);
// };

const triggerFileInput = () => {
  document.getElementById('fileInput').click();
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    const fileName = files[0].name;
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    messages.value.push({
      type: 'user',
      content: `[文件] ${fileName}`,
      time
    });
    
    // 模拟AI回复
    setTimeout(() => {
      const aiNow = new Date();
      const aiTime = aiNow.getHours().toString().padStart(2, '0') + ':' + aiNow.getMinutes().toString().padStart(2, '0');
      messages.value.push({
        type: 'ai',
        content: `已收到文件 ${fileName}，我将为您分析相关法律内容。`,
        time: aiTime
      });
    }, 1000);
  }
};

const goToHome = () => {
  router.push('/user');
};

const saveChat = () => {
  // 实现保存对话功能
  console.log('保存对话');
  // 这里可以添加保存对话的逻辑，比如将对话内容保存到本地存储或服务器
};

const formatDate = (date) => {
  if (!date) return '';
  
  // 处理时间戳
  if (typeof date === 'number') {
    const d = new Date(date);
    return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
  }
  
  // 处理日期字符串
  if (typeof date === 'string') {
    // 处理ISO格式的日期字符串
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    // 处理普通日期字符串
    return date;
  }
  
  return '';
};

const loadChatHistory = async (sessionIdParam) => {
  try {
    // 更新当前sessionId
    sessionId.value = sessionIdParam;
    
    // 调用API获取对话详情
    const response = await getChatDetailApi(sessionIdParam);
    
    if (response.code === 1 && response.data) {
      // 清空当前消息列表
      messages.value = [];
      
      // 处理返回的对话消息
      response.data.forEach(item => {
        // 添加用户问题
        messages.value.push({
          type: 'user',
          content: item.question,
          time: item.createTime
        });
        
        // 添加AI回答
        messages.value.push({
          type: 'ai',
          content: item.answer,
          time: item.createTime,
          dataCards: item.dataCards || []
        });
      });
      
      // 滚动到最新消息
      setTimeout(() => {
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }, 100);
    }
  } catch (error) {
    console.error('加载历史对话失败:', error);
  }
};

const deleteSession = async (sessionIdParam, index) => {
  // 显示确认弹窗
  if (confirm('确定要删除该会话吗？')) {
    try {
      // 调用API删除会话
      const response = await deleteSessionApi(sessionIdParam);
      
      if (response.code === 1) {
        // 从本地列表中移除会话
        chatHistoryList.value.splice(index, 1);
        
        // 如果当前正在查看的是被删除的会话，清空消息列表
        if (sessionId.value === sessionIdParam) {
          messages.value = [
            {
              type: 'ai',
              content: '您好！我是法律智能助手，很高兴为您提供法律咨询服务。请问有什么法律问题需要帮助？',
              time: '09:00'
            }
          ];
          // 重新生成sessionId
          const generateUUID = () => {
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
            // 确保UUID长度不超过64个字符
            return uuid.substring(0, 64);
          };
          sessionId.value = generateUUID();
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  }
};

const navigateToDetail = (card) => {
  if (card.type === 'law_article') {
    // 跳转到法律条文详情页面，并传递当前页面路径作为参数
    router.push({
      path: `/user/law/detail/${card.lawArticle.id}`,
      query: {
        returnPath: '/user/ai'
      }
    });
  }
};

const createNewChat = async () => {
  // 生成UUID，确保长度不超过64个字符
  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    // 确保UUID长度不超过64个字符
    return uuid.substring(0, 64);
  };
  
  const newSessionId = generateUUID();
  sessionId.value = newSessionId;
  
  try {
    // 调用createSession接口，将前端生成的UUID作为sessionId传入
    const response = await createSessionApi(newSessionId);
    
    // 清空当前消息列表
    messages.value = [];
    
    // 添加欢迎消息
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    messages.value.push({
      type: 'ai',
      content: '我是一位专业、严谨的法律信息助理，我叫小鱼律智助手。我的职责是帮助用户理解法律概念、查询相关法律条文或典型案例，并基于提供的法律检索工具返回的结果，给出准确、有依据的回答。',
      time
    });
    
    // 创建新对话对象
    const newChat = {
      id: sessionId,
      sessionId: sessionId,
      title: '新对话',
      time: '刚刚',
      content: '我是一位专业、严谨的法律信息助理，我叫小鱼律智助手...'
    };
    
    // 将新对话添加到列表开头
    chatHistoryList.value.unshift(newChat);
  } catch (error) {
    console.error('创建会话失败:', error);
    // 失败时仍然创建本地对话
    // 清空当前消息列表
    messages.value = [];
    
    // 添加欢迎消息
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    messages.value.push({
      type: 'ai',
      content: '我是一位专业、严谨的法律信息助理，我叫小鱼律智助手。我的职责是帮助用户理解法律概念、查询相关法律条文或典型案例，并基于提供的法律检索工具返回的结果，给出准确、有依据的回答。',
      time
    });
    
    const newChat = {
      id: newSessionId,
      sessionId: newSessionId,
      title: '新对话',
      time: '刚刚',
      content: '我是一位专业、严谨的法律信息助理，我叫小鱼律智助手...'
    };
    
    chatHistoryList.value.unshift(newChat);
  }
};

// 组件挂载时初始化
onMounted(async () => {
  // 初始化sessionId
  if (!sessionId.value) {
    const generateUUID = () => {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      // 确保UUID长度不超过64个字符
      return uuid.substring(0, 64);
    };
    sessionId.value = generateUUID();
  }
  
  // 获取历史对话数据
  try {
    const response = await getHistoryApi();
    if (response.code === 1 && response.data && response.data.length > 0) {
      // 处理历史对话数据，截断title和content
      chatHistoryList.value = response.data.map(item => ({
        id: item.id,
        sessionId: item.sessionId,
        title: item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title,
        time: item.createTime,
        content: item.content.length > 15 ? item.content.substring(0, 15) + '...' : item.content
      }));
      
      // 自动加载最近一次的对话详情
      const latestSessionId = response.data[0].sessionId;
      await loadChatHistory(latestSessionId);
    }
  } catch (error) {
    console.error('获取历史对话失败:', error);
  }
  
  // 滚动到最新消息
  const chatHistory = document.getElementById('chatHistory');
  chatHistory.scrollTop = chatHistory.scrollHeight;
});
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 按钮样式 */
button {
  border: none;
  outline: none;
  background: none;
  cursor: pointer;
}

/* 基础样式 */
.bg-background {
  background-color: #F8FAFC;
}

.text-text {
  color: #0F172A;
}

.text-primary {
  color: #1E3A8A;
}

.bg-primary {
  background-color: #1E3A8A;
}

.bg-secondary {
  background-color: #1E40AF;
}

.text-secondary {
  color: #1E40AF;
}

.bg-blue-50 {
  background-color: #EFF6FF;
}

.font-serif {
  font-family: 'EB Garamond', serif;
}

.font-sans {
  font-family: 'Lato', sans-serif;
}

/* 布局样式 */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: flex-end;
}

.flex-1 {
  flex: 1;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.h-screen {
  height: 100vh;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-y-auto {
  overflow-y: auto;
}

/* 间距样式 */
.p-2 {
  padding: 0.5rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.ml-3 {
  margin-left: 0.75rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.mr-4 {
  margin-right: 1rem;
}

.ml-auto {
  margin-left: auto;
}

.space-y-1 {
  gap: 0.25rem;
}

.space-y-2 {
  gap: 0.5rem;
}

.space-y-6 {
  gap: 1.5rem;
}

.space-x-3 {
  gap: 0.75rem;
}

.space-x-6 {
  gap: 1.5rem;
}

/* 边框样式 */
.border {
  border: 1px solid;
}

.border-r {
  border-right: 1px solid;
}

.border-t {
  border-top: 1px solid;
}

.border-b {
  border-bottom: 1px solid;
}

.border-gray-100 {
  border-color: #f3f4f6;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

/* 圆角样式 */
.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

/* 背景样式 */
.bg-white {
  background-color: #ffffff;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-gray-200 {
  background-color: #e5e7eb;
}

/* 文本样式 */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-800 {
  color: #1f2937;
}

.text-white {
  color: #ffffff;
}

/* 阴影样式 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 过渡效果 */
.transition-all {
  transition: all 0.3s ease-in-out;
}

.transition-smooth {
  transition: all 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* 宽度样式 */
.py-6 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.w-10 {
  width: 2.5rem;
}

.w-12 {
  width: 3rem;
}

.w-32 {
  width: 8rem;
}

.w-36 {
  width: 9rem;
}

.w-64 {
  width: 16rem;
}

.w-16 {
  width: 4rem;
}

.max-w-\[80\%\] {
  max-width: 80%;
}

.flex-1 {
  flex: 1;
}

/* 高度样式 */
.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-32 {
  height: 8rem;
}

.h-36 {
  height: 9rem;
}

/* 滚动条样式 */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

/* 动画效果 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 隐藏样式 */
.hidden {
  display: none;
}

/* 悬停效果 */
.hover\:bg-blue-50:hover {
  background-color: #EFF6FF;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:bg-secondary:hover {
  background-color: #1E40AF;
}

.hover\:text-primary:hover {
  color: #1E3A8A;
}

.hover\:text-secondary:hover {
  color: #1E40AF;
}

.hover\:border-primary:hover {
  border-color: #1E3A8A;
}

.hover\:shadow-sm:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* 聚焦效果 */
.focus\:outline-none:focus {
  outline: none;
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.5);
}

.focus\:ring-primary:focus {
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.5);
}

.focus\:border-transparent:focus {
  border-color: transparent;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 定位样式 */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.z-10 {
  z-index: 10;
}

/* 不透明度 */
.opacity-10 {
  opacity: 0.1;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .w-64 {
    width: 12rem;
  }
  
  .w-16 {
    width: 3rem;
  }
  
  .w-36 {
    width: 8rem;
  }
  
  .h-36 {
    height: 8rem;
  }
}
</style>