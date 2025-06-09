let wheel;
let options = ['工作', '休息'];
let colors = [];
let currentRotation = 0;
let isSpinning = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    wheel = document.getElementById('wheel');
    document.getElementById('spinBtn').addEventListener('click', spin);
    document.getElementById('addOptionBtn').addEventListener('click', addOption);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    
    // 监听输入变化
    document.getElementById('optionsList').addEventListener('input', function() {
        updateWheel();
    });
    
    updateWheel();
});

// 生成柔和的颜色
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

// 更新转盘
function updateWheel() {
    // 从输入框获取选项
    const inputs = document.querySelectorAll('.option-item input');
    options = [];
    inputs.forEach(input => {
        if (input.value.trim()) {
            options.push(input.value.trim());
        }
    });
    
    if (options.length < 2) {
        return;
    }
    
    generateColors();
    drawWheel();
}

// 绘制转盘
function drawWheel() {
    const ctx = wheel.getContext('2d');
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = 160;
    
    ctx.clearRect(0, 0, wheel.width, wheel.height);
    
    const anglePerSlice = (2 * Math.PI) / options.length;
    
    for (let i = 0; i < options.length; i++) {
        // 修正：调整起始角度，使第一个扇形从顶部开始
        const startAngle = i * anglePerSlice - Math.PI / 2;
        const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = colors[i];
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSlice / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 限制文字长度
        let text = options[i];
        if (text.length > 8) {
            text = text.substring(0, 7) + '...';
        }
        ctx.fillText(text, radius * 0.65, 0);
        ctx.restore();
    }
}

// 转动转盘
function spin() {
    if (isSpinning) return;
    
    updateWheel();
    
    if (options.length < 2) {
        alert('请至少输入两个选项！');
        return;
    }
    
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    
    const spinDuration = 3000 + Math.random() * 2000; // 3-5秒
    const spinRotations = 5 + Math.random() * 5; // 5-10圈
    const totalRotation = spinRotations * 360 + Math.random() * 360;
    
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // 缓动函数
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + totalRotation * easeOut;
        wheel.style.transform = `rotate(${currentRotation}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            document.getElementById('spinBtn').disabled = false;
            showResult();
        }
    }
    
    animate();
}

// 显示结果
function showResult() {
    // 修正：计算指针指向的选项
    const normalizedRotation = currentRotation % 360;
    const anglePerSlice = 360 / options.length;
    
    // 指针在顶部，所以需要计算哪个扇形在顶部
    // 由于转盘顺时针旋转，需要反向计算
    let adjustedRotation = (360 - normalizedRotation) % 360;
    
    // 确保结果在 0-360 范围内
    if (adjustedRotation < 0) {
        adjustedRotation += 360;
    }
    
    // 计算选中的索引
    const selectedIndex = Math.floor(adjustedRotation / anglePerSlice) % options.length;
    const result = options[selectedIndex];
    
    // 显示弹窗
    document.getElementById('resultText').textContent = result;
    document.getElementById('resultModal').style.display = 'block';
    
    // 添加到历史记录
    addToHistory(result);
}

// 关闭弹窗
function closeModal() {
    document.getElementById('resultModal').style.display = 'none';
}

// 添加到历史记录
function addToHistory(result) {
    const historyList = document.getElementById('historyList');
    const historyItem = document.createElement('span');
    historyItem.className = 'history-item';
    historyItem.textContent = result;
    
    // 添加到开头
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // 保持最多8条记录
    while (historyList.children.length > 8) {
        historyList.removeChild(historyList.lastChild);
    }
}

function clearHistory() {
    document.getElementById('historyList').innerHTML = '';
}

// 添加选项
function addOption() {
    const optionsList = document.getElementById('optionsList');
    if (optionsList.children.length >= 12) {
        alert('最多支持12个选项！');
        return;
    }
    
    const newOption = document.createElement('div');
    newOption.className = 'option-item';
    newOption.innerHTML = `
        <input type="text" placeholder="输入选项">
        <button class="remove-btn" onclick="removeOption(this)">×</button>
    `;
    optionsList.appendChild(newOption);
    
    // 聚焦到新输入框
    const newInput = newOption.querySelector('input');
    newInput.focus();
    
    // 添加输入事件监听
    newInput.addEventListener('input', updateWheel);
}

// 删除选项
function removeOption(btn) {
    const optionsList = document.getElementById('optionsList');
    if (optionsList.children.length > 2) {
        btn.parentElement.remove();
        updateWheel();
    } else {
        alert('至少需要保留两个选项！');
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target == modal) {
        closeModal();
    }
}

// ESC键关闭弹窗
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
