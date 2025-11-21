// UI反馈组件

// 创建加载指示器元素
function createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-message"></div>
    `;
    document.body.appendChild(indicator);
    return indicator;
}

// 显示加载指示器
export function showLoadingIndicator(message = '加载中...') {
    let indicator = document.querySelector('.loading-indicator');
    if (!indicator) {
        indicator = createLoadingIndicator();
    }
    indicator.querySelector('.loading-message').textContent = message;
    indicator.style.display = 'flex';
}

// 隐藏加载指示器
export function hideLoadingIndicator() {
    const indicator = document.querySelector('.loading-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// 创建错误消息元素
function createErrorMessage(options) {
    const { title, message, actionText, actionHandler } = options;
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <div class="error-content">
            <h3>${title}</h3>
            <p>${message}</p>
            ${actionText ? `<button class="error-action">${actionText}</button>` : ''}
        </div>
    `;

    if (actionText && actionHandler) {
        const actionButton = errorElement.querySelector('.error-action');
        actionButton.addEventListener('click', actionHandler);
    }

    document.body.appendChild(errorElement);
    return errorElement;
}

// 显示错误消息
export function showErrorMessage(options) {
    let errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
    errorElement = createErrorMessage(options);
    errorElement.style.display = 'flex';
}

// 隐藏错误消息
export function hideErrorMessage() {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}