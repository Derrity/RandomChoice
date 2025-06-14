let wheel;
let options = ['工作', '休息']; // 默认选项，可以根据实际情况保留或在 updateWheel 中完全依赖输入
let colors = [];
let currentRotation = 0;
let isSpinning = false;
let historyList; // 用于存储历史记录列表的 DOM 元素

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    wheel = document.getElementById('wheel');
    document.getElementById('spinBtn').addEventListener('click', spin);
    document.getElementById('addOptionBtn').addEventListener('click', addOption);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    
    // 监听选项列表容器中输入框的变化（使用事件委托，更高效）
    if (optionsListContainer) {
        optionsListContainer.addEventListener('input', function(event) {
            if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
                updateWheel();
            }
        });
        // 也监听移除按钮的点击，以便在选项少于2个时能正确处理
        optionsListContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-btn')) {
                // 移除操作由 removeOption(this) 内联处理，
                // 但之后我们可能需要重新调用 updateWheel 来确保转盘状态正确
                // （特别是在选项少于2个时）
                // 延迟一小段时间确保DOM更新完毕
                setTimeout(updateWheel, 0);
            }
        });
    }

    // 为清空历史按钮添加事件监听器
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // 初始化时从现有的输入框加载选项并绘制转盘
    updateOptionsFromInputs(); // 新增一个函数来从输入框初始化选项
    updateWheel(); // 初始绘制转盘
});

// 从输入框更新 options 数组
function updateOptionsFromInputs() {
    const inputs = document.querySelectorAll('.options-list .option-item input');
    options = [];
    inputs.forEach(input => {
        if (input.value.trim()) {
            options.push(input.value.trim());
        }
    });
}

// 生成颜色
function generateColors() {
    const baseColors = [
        '#3498db', '#2ecc71', '#f39c12', '#e74c3c', 
        '#9b59b6', '#1abc9c', '#34495e', '#16a085',
        '#27ae60', '#2980b9', '#8e44ad', '#c0392b'
    ];
    
    colors = [];
    for (let i = 0; i < options.length; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
}

// 更新转盘（选项和绘制）
function updateWheel() {
    updateOptionsFromInputs(); // 每次更新都从输入框重新获取选项
    
    if (options.length < 2) {
        // 如果选项少于2个，可以考虑清除转盘或显示提示信息
        const ctx = wheel.getContext('2d');
        ctx.clearRect(0, 0, wheel.width, wheel.height);
        // 可选：禁用旋转按钮
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) spinBtn.disabled = true;
        return;
    }
    
    // 可选：启用旋转按钮
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) spinBtn.disabled = false;

    generateColors();
    drawWheel();
}

// 绘制转盘
function drawWheel() {
    if (!wheel) return; // 确保 wheel 元素存在
    const ctx = wheel.getContext('2d');
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = Math.min(centerX, centerY) * 0.9; // 半径调整为画布较小边的90%
    
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    
    if (options.length === 0) return; // 没有选项则不绘制

    const anglePerSlice = (2 * Math.PI) / options.length;
    
    for (let i = 0; i < options.length; i++) {
        const startAngle = i * anglePerSlice - Math.PI / 2; // 从顶部开始
        const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath(); // 闭合路径以形成扇形
        ctx.fillStyle = colors[i % colors.length]; // 使用 colors 数组中的颜色
        ctx.fill();
        
        ctx.strokeStyle = '#fff'; // 白色描边
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSlice / 2); // 旋转到扇形中间
        ctx.textAlign = 'right'; // 文字对齐方式
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff'; // 文字颜色
        ctx.font = 'bold 16px Arial'; // 字体样式

        let text = options[i];
        if (text.length > 8) { // 限制文字长度
            text = text.substring(0, 7) + '...';
        }
        ctx.fillText(text, radius * 0.75, 0); // 文字绘制在半径的75%处
        ctx.restore();
    }
}

// 转动转盘
function spin() {
    if (isSpinning) return;
    
    updateWheel(); // 确保转盘是最新的
    
    if (options.length < 2) {
        alert('请至少输入两个选项！');
        return;
    }
    
    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) spinBtn.disabled = true; // 禁用按钮防止重复点击

    const totalSpins = Math.floor(Math.random() * 5) + 5; // 随机旋转圈数 (5-9圈)
    const randomAngle = Math.random() * 360; // 最终停止的随机角度
    const targetRotation = currentRotation + (totalSpins * 360) + randomAngle;
    
    const spinDuration = 4000; // 旋转持续时间 (毫秒)
    
    wheel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
    wheel.style.transform = `rotate(${targetRotation}deg)`;
    
    currentRotation = targetRotation % 360; // 更新当前基准角度 (只取360度内的部分)

    setTimeout(() => {
        isSpinning = false;
        if (spinBtn) spinBtn.disabled = false; // 重新启用按钮
        
        const finalRotation = targetRotation % 360; // 得到最终指向的角度 (0-359)
        const anglePerSlice = 360 / options.length;
        // 计算指针指向哪个扇区 (需要考虑初始偏移，即第一个扇区的中心线)
        // 假设指针固定向上，转盘旋转。我们需要计算哪个扇区的中心线最接近顶部。
        // 调整角度，使0度对应第一个扇区的起始边缘或中心（取决于drawWheel的实现）
        // 在我们的drawWheel中，第一个扇形从 -PI/2 (即顶部) 开始。
        // 指针指向的是转盘的顶部。所以我们要计算哪个扇区转到了顶部。
        let winningIndex = Math.floor(options.length - (finalRotation / anglePerSlice)) % options.length;
        // 由于旋转是顺时针的，角度增加。如果 finalRotation 是 0，意味着第一个扇区在顶部。
        // 如果 finalRotation 是 anglePerSlice/2，意味着第一个扇区的中心在顶部。
        // 我们需要将 finalRotation 映射到选项索引。
        // 修正索引计算逻辑：
        const normalizedRotation = (360 - finalRotation + (anglePerSlice / 2)) % 360; // 归一化并偏移半个扇区
        winningIndex = Math.floor(normalizedRotation / anglePerSlice) % options.length;


        const selectedOption = options[winningIndex];
        
        showResultModal(selectedOption);
        updateHistory(selectedOption);

        // 重置转盘到视觉上的初始位置（可选，或者让它停在结果处）
        // wheel.style.transition = 'none';
        // wheel.style.transform = `rotate(${currentRotation}deg)`; // 如果希望它停在结果处

    }, spinDuration + 100); // 稍作延迟以确保动画完成
}

// 显示结果弹窗
function showResultModal(result) {
    const modal = document.getElementById('resultModal');
    const resultText = document.getElementById('resultText');
    if (modal && resultText) {
        resultText.textContent = result;
        modal.style.display = 'flex';
    }
}

// 关闭结果弹窗 (这个函数应该在你的 HTML 中被调用，例如 <button onclick="closeModal()">好的</button>)
function closeModal() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function clearHistory() {
    document.getElementById('historyList').innerHTML = '';
}

// 添加选项
function addOption() {
    const optionsList = document.getElementById('optionsList');
    if (!optionsList) return;

    const newItem = document.createElement('div');
    newItem.classList.add('option-item');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '输入选项';
    
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '×';
    removeBtn.onclick = function() { removeOption(this); }; // 绑定移除事件
    
    newItem.appendChild(input);
    newItem.appendChild(removeBtn);
    optionsList.appendChild(newItem);
    
    updateWheel(); // 添加后更新转盘
    input.focus(); // 新增输入框获取焦点
}

// 移除选项 (这个函数应该在你的 HTML 中被调用，例如 <button class="remove-btn" onclick="removeOption(this)">×</button>)
function removeOption(buttonElement) {
    if (buttonElement && buttonElement.parentElement) {
        // 确保至少保留两个选项以便转盘运行，或者根据你的逻辑调整
        const optionsList = document.getElementById('optionsList');
        if (optionsList && optionsList.children.length > 0) { // 改为允许移除到0个，由updateWheel处理逻辑
            buttonElement.parentElement.remove();
            updateWheel(); // 移除后更新转盘
        }
    }
}

// 更新历史记录
function updateHistory(result) {
    if (!historyList) return; // 确保 historyList 存在

    const newItem = document.createElement('div');
    newItem.classList.add('history-item'); // 假设你有 .history-item 的 CSS 样式
    newItem.textContent = result;
    
    // 将新条目添加到列表的顶部
    if (historyList.firstChild) {
        historyList.insertBefore(newItem, historyList.firstChild);
    } else {
        historyList.appendChild(newItem);
    }

    // 可选：限制历史记录数量
    const maxHistoryItems = 10; 
    while (historyList.children.length > maxHistoryItems) {
        historyList.removeChild(historyList.lastChild);
    }
}

// 清空历史记录
function clearHistory() {
    if (historyList) {
        historyList.innerHTML = ''; // 清空显示的 DOM 内容
        // 如果你将历史记录还存储在其他JavaScript数组或localStorage，也需要在这里清除
        // 例如: let savedResultsArray = []; savedResultsArray = [];
        // localStorage.removeItem('decisionHistory');
    }
}