// 导入样式
import '../css/styles.css';
import '../css/components.css';

// 导入功能模块
import './animations.js';
import '../i18n.js';
import './ad-manager.js';
import { uiFeedback } from './modules/ui-feedback.js';

// 反馈提交功能
async function submitFeedback() {
  const nameInput = /** @type {HTMLInputElement} */ (document.getElementById('name'));
  const contactInput = /** @type {HTMLInputElement} */ (document.getElementById('contact'));
  const questionInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('question'));

  // 检查元素是否存在
  if (!nameInput || !contactInput || !questionInput) {
    uiFeedback.showToast('表单加载失败，请刷新页面重试', 'error');
    return;
  }

  const name = nameInput.value.trim();
  const contact = contactInput.value.trim();
  const question = questionInput.value.trim();

  // 验证输入
  if (!name || !question) {
    uiFeedback.showToast('请填写所有必填项', 'error');
    return;
  }

  try {
    uiFeedback.showLoading('正在提交反馈...');
    
    // 发送请求
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        contact,
        question
      })
    });

    if (!response.ok) {
      throw new Error('提交失败');
    }

    // 清空表单
    if (nameInput) nameInput.value = '';
    if (contactInput) contactInput.value = '';
    if (questionInput) questionInput.value = '';
    
    uiFeedback.showToast('提交成功！', 'success');
  } catch (error) {
    uiFeedback.showToast('提交失败，请稍后重试', 'error');
    console.error('提交反馈失败:', error);
  } finally {
    uiFeedback.hideLoading();
  }
}

// 绑定提交函数到全局
/** @type {Window & typeof globalThis & { submitFeedback: typeof submitFeedback }} */
(window).submitFeedback = submitFeedback;
