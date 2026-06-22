let currentUser = null;
let users = JSON.parse(localStorage.getItem('donatovUsers')) || {};
let userData = JSON.parse(localStorage.getItem('donatovUserData')) || {};
let dailySpecial = JSON.parse(localStorage.getItem('donatovDaily')) || {};
let activePromoCodes = JSON.parse(localStorage.getItem('donatovPromoCodes')) || {};

function saveUsers() { localStorage.setItem('donatovUsers', JSON.stringify(users)); }
function saveUserData() { localStorage.setItem('donatovUserData', JSON.stringify(userData)); }
function saveDaily() { localStorage.setItem('donatovDaily', JSON.stringify(dailySpecial)); }
function savePromoCodes() { localStorage.setItem('donatovPromoCodes', JSON.stringify(activePromoCodes)); }

function initUserData(username) {
    if (!userData[username]) {
        userData[username] = {
            ore: 0,
            rubles: 50,
            gold: 0,
            diamond: 0,
            emerald: 0,
            email: '',
            history: [],
            donations: [],
            cases: [],
            lastSpecial: 0,
            specialCooldowns: {},
            promoCodes: [] // сохраняем полученные промокоды
        };
        saveUserData();
    }
}

function getResourceIcon(type) {
    const icons = {
        gold: '<img src="logotips/zo.jpg" style="width:28px; height:28px; object-fit:contain; display:inline-block; vertical-align:middle;">',
        diamond: '<img src="logotips/al.jpg" style="width:28px; height:28px; object-fit:contain; display:inline-block; vertical-align:middle;">',
        emerald: '<img src="logotips/iz.jpg" style="width:28px; height:28px; object-fit:contain; display:inline-block; vertical-align:middle;">'
    };
    return icons[type] || type;
}

document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (target) {
            target.type = target.type === 'password' ? 'text' : 'password';
            btn.textContent = target.type === 'password' ? '👁️' : '🙈';
        }
    });
});

document.getElementById('showRegisterBtn').onclick = () => {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('forgotForm').style.display = 'none';
};
document.getElementById('showLoginBtn').onclick = () => {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'none';
};
document.getElementById('showForgotBtn').onclick = () => {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'block';
};
document.getElementById('showLoginFromForgotBtn').onclick = () => {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'none';
};

document.getElementById('registerBtn').onclick = () => {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    if (!username || !email || !password || password !== confirm) {
        alert('Заполните все поля или пароли не совпадают');
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        alert('Введите корректный email');
        return;
    }
    if (users[username]) {
        alert('Такой игрок уже существует');
        return;
    }
    users[username] = { password, email };
    initUserData(username);
    userData[username].email = email;
    saveUsers();
    saveUserData();
    alert('Регистрация успешна! Теперь войдите.');
    document.getElementById('showLoginBtn').click();
};

document.getElementById('loginBtn').onclick = () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!users[username] || users[username].password !== password) {
        alert('Неверный логин или пароль');
        return;
    }
    currentUser = username;
    initUserData(username);
    document.getElementById('authPanel').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userNameDisplay').textContent = username;
    updateUI();
    renderDonates('anarchy');
    renderCases();
    renderSpecial();
    renderLeaders();
    startSpecialTimers();
    setTimeout(initParticles, 500);
};

document.getElementById('forgotBtn').onclick = () => {
    const username = document.getElementById('forgotUsername').value.trim();
    const email = document.getElementById('forgotEmail').value.trim();
    if (!username || !email) {
        alert('Введите никнейм и email');
        return;
    }
    if (!users[username]) {
        alert('Пользователь не найден');
        return;
    }
    if (users[username].email !== email) {
        alert('Email не совпадает с указанным при регистрации');
        return;
    }
    showEmailReceipt('восстановление пароля', `Ваш пароль: ${users[username].password}`, email);
};

document.getElementById('logoutBtn').onclick = () => {
    currentUser = null;
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('authPanel').style.display = 'flex';
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) cursor.remove();
    const style = document.querySelector('style[data-cursor]');
    if (style) style.remove();
};

function updateUI() {
    const data = userData[currentUser];
    document.getElementById('balanceOre').textContent = data.ore;
    document.getElementById('balanceRubles').textContent = data.rubles;
    document.getElementById('balanceGold').innerHTML = getResourceIcon('gold') + ' ' + data.gold;
    document.getElementById('balanceDiamond').innerHTML = getResourceIcon('diamond') + ' ' + data.diamond;
    document.getElementById('balanceEmerald').innerHTML = getResourceIcon('emerald') + ' ' + data.emerald;
    document.getElementById('profileName').textContent = currentUser;
    document.getElementById('profileEmail').textContent = data.email || 'Не указан';
    document.getElementById('profileOre').textContent = data.ore;
    document.getElementById('profileRubles').textContent = data.rubles;
    document.getElementById('profileGold').innerHTML = getResourceIcon('gold') + ' ' + data.gold;
    document.getElementById('profileDiamond').innerHTML = getResourceIcon('diamond') + ' ' + data.diamond;
    document.getElementById('profileEmerald').innerHTML = getResourceIcon('emerald') + ' ' + data.emerald;
    renderHistory();
}

document.getElementById('updateEmailBtn').onclick = () => {
    const newEmail = document.getElementById('updateEmailInput').value.trim();
    if (!newEmail || !newEmail.includes('@') || !newEmail.includes('.')) {
        alert('Введите корректный email');
        return;
    }
    userData[currentUser].email = newEmail;
    users[currentUser].email = newEmail;
    saveUsers();
    saveUserData();
    updateUI();
    showToast('✅ Email обновлён!');
};

function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#e8b44b; color:#0a0c12; padding:12px 24px; border-radius:60px; z-index:10000; font-weight:bold; font-family:"Orbitron",sans-serif;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

const oreSlider = document.getElementById('oreSlider');
const oreAmountDisplay = document.getElementById('oreAmountDisplay');
const orePriceDisplay = document.getElementById('orePriceDisplay');

oreSlider.oninput = () => {
    const val = parseInt(oreSlider.value);
    oreAmountDisplay.textContent = val + ' руды';
    orePriceDisplay.textContent = (val / 5).toFixed(1) + ' ₽';
};

document.getElementById('buyOreBtn').onclick = () => {
    if (!currentUser) {
        alert('Сначала войдите в аккаунт!');
        return;
    }
    const amount = parseInt(oreSlider.value);
    const price = amount / 5;
    const data = userData[currentUser];
    if (data.rubles < price) {
        document.getElementById('purchaseModal').style.display = 'flex';
        document.getElementById('purchaseTitle').textContent = '💎 Пополнение руды';
        document.getElementById('purchaseDesc').textContent = `Вы хотите купить ${amount} руды за ${price.toFixed(1)} ₽`;
        document.getElementById('purchasePrice').textContent = `💰 Цена: ${price.toFixed(1)} ₽`;
        document.getElementById('purchaseNick').value = currentUser;
        document.getElementById('purchaseEmail').value = data.email || '';
        document.getElementById('purchasePromo').value = '';
        currentPurchase = { type: 'ore', amount, price, desc: `Пополнение руды: ${amount} шт` };
        document.querySelector('.payment-methods').style.display = 'flex';
        document.querySelector('.payment-methods').innerHTML = `
            <div style="width:100%; text-align:center; margin-bottom:10px; color:#e8b44b; font-weight:bold;">💳 Выберите способ оплаты</div>
            <button class="payment-btn" data-method="card" style="flex:1; background:#1a1c2a; border:1px solid #e8b44b; color:#e8b44b; padding:10px 20px; border-radius:40px; font-weight:bold; cursor:pointer;">💳 Банковская карта</button>
            <button class="payment-btn" data-method="crypto" style="flex:1; background:#1a1c2a; border:1px solid #e8b44b; color:#e8b44b; padding:10px 20px; border-radius:40px; font-weight:bold; cursor:pointer;">🪙 Криптовалюта</button>
        `;
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                selectedPaymentMethod = btn.dataset.method;
                document.querySelectorAll('.payment-btn').forEach(b => {
                    b.style.background = '#1a1c2a';
                    b.style.border = '1px solid #e8b44b';
                    b.style.color = '#e8b44b';
                });
                if (selectedPaymentMethod === 'card') {
                    btn.style.background = '#e8b44b';
                    btn.style.border = '2px solid #e8b44b';
                    btn.style.color = '#0a0c12';
                } else {
                    btn.style.background = '#2a5a8a';
                    btn.style.border = '2px solid #4a8ac4';
                    btn.style.color = '#fff';
                }
                document.getElementById('purchaseConfirmBtn').click();
            };
        });
        return;
    }
    data.rubles -= price;
    data.ore += amount;
    data.history.push({ type: 'Пополнение руды', amount, price });
    saveUserData();
    updateUI();
    showReceipt(`Вы пополнили баланс на ${amount} руды. Сумма: ${price.toFixed(1)} ₽. Спасибо за покупку!`);
    sendEmailReceipt('Пополнение руды', `Вы пополнили баланс на ${amount} руды. Сумма: ${price.toFixed(1)} ₽`, data.email);
};

function sendEmailReceipt(title, content, email) {
    if (!email) return;
    showEmailReceipt(title, content, email);
}

function showEmailReceipt(title, content, email) {
    const modal = document.createElement('div');
    modal.className = 'email-receipt';
    modal.innerHTML = `
        <h2>📧 Письмо отправлено</h2>
        <div style="color:#8a8a9a; margin-bottom:16px;">На ${email}</div>
        <div class="receipt-detail"><strong>📌 Тема:</strong> ${title}</div>
        <div class="receipt-detail"><strong>📄 Содержание:</strong><br>${content}</div>
        <div class="receipt-footer">💡 Это демо-версия. В реальном проекте письмо пришло бы на почту.</div>
        <button onclick="this.closest('.email-receipt').remove()" style="margin-top:16px; background:#e8b44b; border:none; padding:10px 30px; border-radius:40px; font-weight:bold; cursor:pointer;">Закрыть</button>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        if (modal.parentNode) modal.remove();
    }, 8000);
}

function showReceipt(text, action = null) {
    document.getElementById('receiptText').textContent = text;
    document.getElementById('receiptActions').style.display = action ? 'flex' : 'none';
    if (action) {
        document.querySelectorAll('.receipt-action-btn').forEach(btn => {
            btn.onclick = () => {
                if (btn.dataset.action === 'server') {
                    alert('🎮 Кейс будет открыт на сервере! Обратитесь к администратору.');
                } else {
                    alert('🌐 Кейс открыт на сайте! Результат: ' + text);
                }
                document.getElementById('receiptModal').style.display = 'none';
            };
        });
    }
    document.getElementById('receiptModal').style.display = 'flex';
}
document.getElementById('closeReceiptBtn').onclick = () => {
    document.getElementById('receiptModal').style.display = 'none';
};

function showDetails(commands, name) {
    document.getElementById('detailsTitle').textContent = `📜 Команды для ${name}`;
    document.getElementById('detailsCommands').textContent = commands;
    document.getElementById('detailsModal').style.display = 'flex';
}
document.getElementById('detailsCloseBtn').onclick = () => {
    document.getElementById('detailsModal').style.display = 'none';
};

let currentPurchase = null;
let selectedPaymentMethod = null;

function openPurchase(item) {
    currentPurchase = item;
    selectedPaymentMethod = null;
    document.getElementById('purchaseTitle').textContent = `Оформление покупки: ${item.name}`;
    document.getElementById('purchaseDesc').textContent = item.desc || '';
    document.getElementById('purchasePrice').textContent = `💰 Цена: ${item.price} ₽`;
    document.getElementById('purchaseNick').value = currentUser;
    document.getElementById('purchaseEmail').value = userData[currentUser].email || '';
    document.getElementById('purchasePromo').value = '';
    
    const promoInput = document.getElementById('purchasePromo');
    promoInput.oninput = function() {
        applyPromoCode();
    };
    
    document.querySelectorAll('.payment-btn').forEach(b => {
        b.style.background = '#1a1c2a';
        b.style.border = '1px solid #e8b44b';
        b.style.color = '#e8b44b';
    });
    
    document.getElementById('purchaseModal').style.display = 'flex';

    document.querySelector('.payment-methods').style.display = 'flex';
    document.querySelector('.payment-methods').innerHTML = `
        <div style="width:100%; text-align:center; margin-bottom:10px; color:#e8b44b; font-weight:bold;">💳 Выберите способ оплаты</div>
        <button class="payment-btn" data-method="card" style="flex:1; background:#1a1c2a; border:1px solid #e8b44b; color:#e8b44b; padding:10px 20px; border-radius:40px; font-weight:bold; cursor:pointer;">💳 Банковская карта</button>
        <button class="payment-btn" data-method="crypto" style="flex:1; background:#1a1c2a; border:1px solid #e8b44b; color:#e8b44b; padding:10px 20px; border-radius:40px; font-weight:bold; cursor:pointer;">🪙 Криптовалюта</button>
    `;

    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            selectedPaymentMethod = btn.dataset.method;
            document.querySelectorAll('.payment-btn').forEach(b => {
                b.style.background = '#1a1c2a';
                b.style.border = '1px solid #e8b44b';
                b.style.color = '#e8b44b';
            });
            if (selectedPaymentMethod === 'card') {
                btn.style.background = '#e8b44b';
                btn.style.border = '2px solid #e8b44b';
                btn.style.color = '#0a0c12';
            } else {
                btn.style.background = '#2a5a8a';
                btn.style.border = '2px solid #4a8ac4';
                btn.style.color = '#fff';
            }
        };
    });
}

function applyPromoCode() {
    const promoInput = document.getElementById('purchasePromo');
    const priceDisplay = document.getElementById('purchasePrice');
    const promo = promoInput.value.trim().toUpperCase();
    
    const basePromoCodes = {
        'DONATOV10': 0.9,
        'VIP2025': 0.85,
        'ANARCHY': 0.8,
        'GRIEFING': 0.75,
        'PROMO2025': 0.7,
        'RAIDER': 0.8,
        'GODLIKE': 0.6,
        'WELCOME': 0.9
    };
    
    const allPromoCodes = { ...basePromoCodes };
    
    for (const [code, discount] of Object.entries(activePromoCodes)) {
        if (!allPromoCodes[code]) {
            allPromoCodes[code] = discount;
        }
    }
    
    if (promo && allPromoCodes[promo]) {
        const discount = allPromoCodes[promo];
        const newPrice = Math.round(currentPurchase.price * discount);
        priceDisplay.innerHTML = `💰 Цена: <span style="color: #ff6666; text-decoration: line-through;">${currentPurchase.price} ₽</span> → <span style="color: #44ff44; font-weight: bold;">${newPrice} ₽</span> (скидка ${Math.round((1-discount)*100)}%)`;
        currentPurchase.discountedPrice = newPrice;
        currentPurchase.discountApplied = true;
        currentPurchase.appliedPromo = promo;
    } else if (promo) {
        priceDisplay.innerHTML = `💰 Цена: <span style="color: #ff6666;">${currentPurchase.price} ₽</span> ❌ Неверный или просроченный промокод`;
        currentPurchase.discountApplied = false;
        delete currentPurchase.discountedPrice;
        delete currentPurchase.appliedPromo;
    } else {
        priceDisplay.innerHTML = `💰 Цена: ${currentPurchase.price} ₽`;
        currentPurchase.discountApplied = false;
        delete currentPurchase.discountedPrice;
        delete currentPurchase.appliedPromo;
    }
}

document.getElementById('purchaseConfirmBtn').onclick = () => {
    if (!selectedPaymentMethod) {
        alert('Пожалуйста, выберите способ оплаты!');
        return;
    }
    const email = document.getElementById('purchaseEmail').value.trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
        alert('Пожалуйста, введите корректный email!');
        return;
    }
    userData[currentUser].email = email;
    users[currentUser].email = email;
    saveUsers();
    saveUserData();
    updateUI();
    
    if (currentPurchase.type === 'case') {
        showServerChoiceForCase(currentPurchase);
        document.getElementById('purchaseModal').style.display = 'none';
        return;
    }
    completePurchase();
};

document.getElementById('purchaseCloseBtn').onclick = () => {
    document.getElementById('purchaseModal').style.display = 'none';
};

function completePurchase() {
    const data = userData[currentUser];
    if (!data) return;

    let finalPrice = currentPurchase.price;
    if (currentPurchase.discountApplied && currentPurchase.discountedPrice) {
        finalPrice = currentPurchase.discountedPrice;
        
        if (currentPurchase.appliedPromo && activePromoCodes[currentPurchase.appliedPromo]) {
            delete activePromoCodes[currentPurchase.appliedPromo];
            savePromoCodes();
            showToast(`✅ Промокод ${currentPurchase.appliedPromo} активирован!`);
        }
    }

    if (data.rubles < finalPrice) {
        const deficit = finalPrice - data.rubles;
        data.rubles += deficit;
        data.history.push({ type: 'Автопополнение баланса', amount: deficit });
    }

    data.rubles -= finalPrice;
    if (data.rubles < 0) data.rubles = 0;

    let receiptText = '';
    if (currentPurchase.type === 'donate') {
        data.donations.push({ name: currentPurchase.name, mode: currentPurchase.mode, date: new Date().toLocaleDateString() });
        data.history.push({ type: `Куплен донат ${currentPurchase.name}`, price: finalPrice });
        receiptText = `🎉 Привилегия ${currentPurchase.name} активирована!\nКоманды: ${currentPurchase.commands || 'Нет команд'}\nСпасибо за покупку!`;
        if (currentPurchase.discountApplied) receiptText += `\n💰 Скидка применена!`;
        showReceipt(receiptText);
        sendEmailReceipt(`Привилегия ${currentPurchase.name}`, receiptText, data.email);
    } else if (currentPurchase.type === 'ore') {
        data.ore += currentPurchase.amount;
        data.history.push({ type: 'Пополнение руды', amount: currentPurchase.amount, price: finalPrice });
        receiptText = `Вы пополнили баланс на ${currentPurchase.amount} руды. Сумма: ${finalPrice.toFixed(1)} ₽`;
        if (currentPurchase.discountApplied) receiptText += `\n💰 Скидка применена!`;
        showReceipt(receiptText);
        sendEmailReceipt('Пополнение руды', receiptText, data.email);
    }

    saveUserData();
    updateUI();
    document.getElementById('purchaseModal').style.display = 'none';
    renderDonates(currentMode);
    renderCases();
    renderSpecial();
}

const donateData = {
    anarchy: [
        { id: 'guide', name: 'GUIDE', price: 30, icon: 'images.a/ko.jpg', desc: 'Базовый набор для новичков', commands: '/kit guide — базовый набор\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (1 шт)\n/home — телепорт к дому\n/приваты: 1 шт' },
        { id: 'wanderer', name: 'WANDERER', price: 80, icon: 'images.a/wa.jpg', desc: 'Странник без границ', commands: '/kit wanderer — набор путешественника\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (2 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/приваты: 3 шт' },
        { id: 'nomad', name: 'NOMAD', price: 150, icon: 'images.a/no.jpg', desc: 'Кочевник пустошей', commands: '/kit nomad — набор кочевника\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (3 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/приваты: 5 шт' },
        { id: 'shadow', name: 'SHADOW', price: 250, icon: 'images.a/sha.jpg', desc: 'Тень среди руин', commands: '/kit shadow — набор тени\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (4 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/приваты: 7 шт' },
        { id: 'warrior', name: 'WARRIOR', price: 400, icon: 'images.a/warr.jpg', desc: 'Воин анархии', commands: '/kit warrior — набор воина\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (5 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/приваты: 10 шт' },
        { id: 'berserk', name: 'BERSERK', price: 700, icon: 'images.a/be.jpg', desc: 'Безумный разрушитель', commands: '/kit berserk — набор берсерка\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (7 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/приваты: 15 шт' },
        { id: 'immortal', name: 'IMMORTAL', price: 1200, icon: 'images.a/im.jpg', desc: 'Бессмертный воин', commands: '/kit immortal — набор бессмертного\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (10 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/god — неуязвимость\n/heal — лечение\n/приваты: 25 шт' },
        { id: 'dragon', name: 'DRAGON', price: 2000, icon: 'images.a/dr.jpg', desc: 'Повелитель драконов', commands: '/kit dragon — набор дракона\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (15 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/god — неуязвимость\n/heal — лечение\n/sun — ясная погода\n/rain — дождь\n/night — ночь\n/day — день\n/grant — выдать донат\n/tp — телепортация\n/приваты: 50 шт' }
    ],
    griefing: [
        { id: 'raider', name: 'RAIDER', price: 40, icon: 'images.g/rai.jpg', desc: 'Начинающий налётчик', commands: '/kit raider — набор налётчика\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (1 шт)\n/home — телепорт к дому\n/приваты: 1 шт' },
        { id: 'saboteur', name: 'SABOTEUR', price: 100, icon: 'images.g/sab.jpg', desc: 'Диверсант', commands: '/kit saboteur — набор диверсанта\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (2 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/приваты: 3 шт' },
        { id: 'destroyer', name: 'DESTROYER', price: 200, icon: 'images.g/dest.jpg', desc: 'Разрушитель основ', commands: '/kit destroyer — набор разрушителя\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (3 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/приваты: 5 шт' },
        { id: 'pyro', name: 'PYRO', price: 300, icon: 'images.g/py.jpg', desc: 'Пироман', commands: '/kit pyro — набор пиромана\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (4 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/приваты: 7 шт' },
        { id: 'titan', name: 'TITAN', price: 500, icon: 'images.g/ti.jpg', desc: 'Гигант грифинга', commands: '/kit titan — набор титана\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (5 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/приваты: 10 шт' },
        { id: 'avenger', name: 'AVENGER', price: 800, icon: 'images.g/av.jpg', desc: 'Мститель', commands: '/kit avenger — набор мстителя\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (7 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/приваты: 15 шт' },
        { id: 'overlord', name: 'OVERLORD', price: 1500, icon: 'images.g/ove.jpg', desc: 'Повелитель', commands: '/kit overlord — набор повелителя\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (10 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/god — неуязвимость\n/heal — лечение\n/приваты: 25 шт' },
        { id: 'magister', name: 'MAGISTER', price: 2200, icon: 'images.g/ma.jpg', desc: 'Мастер магии', commands: '/kit magister — набор мага\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (12 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/god — неуязвимость\n/heal — лечение\n/sun — ясная погода\n/rain — дождь\n/приваты: 35 шт' },
        { id: 'imperator', name: 'IMPERATOR', price: 3500, icon: 'images.g/imp.jpg', desc: 'Император', commands: '/kit imperator — набор императора\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (20 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/god — неуязвимость\n/heal — лечение\n/sun — ясная погода\n/rain — дождь\n/night — ночь\n/day — день\n/приваты: 60 шт' },
        { id: 'god', name: 'GOD', price: 5000, icon: 'images.g/go.jpg', desc: 'Всемогущий бог', commands: '/kit god — набор бога\n/fly — режим полёта\n/back — телепорт к месту смерти\n/sethome — установить дом (50 шт)\n/home — телепорт к дому\n/workbench — доступ к верстаку\n/enderchest — доступ к эндер-сундуку\n/feed — восстановление голода\n/repair — починка предметов\n/vanish — невидимость\n/speed — ускорение\n/strength — сила\n/resistance — сопротивление\n/haste — ускорение добычи\n/jump — увеличение прыжка\n/god — неуязвимость\n/heal — лечение\n/sun — ясная погода\n/rain — дождь\n/night — ночь\n/day — день\n/grant — выдать донат\n/tp — телепортация\n/broadcast — объявление\n/mute — мут\n/unmute — размут\n/приваты: 999 шт' }
    ]
};

let currentMode = 'anarchy';

function renderDonates(mode) {
    const grid = document.getElementById('donateGrid');
    grid.innerHTML = '';
    const data = donateData[mode] || [];
    data.forEach(d => {
        const card = document.createElement('div');
        card.className = 'donate-card';
        card.innerHTML = `
            <div class="icon"><img src="${d.icon}" alt="${d.name}" style="width:80px; height:80px; object-fit:contain; max-width:100%;"></div>
            <h3>${d.name}</h3>
            <div class="price">💰 ${d.price} ₽</div>
            <div class="desc">${d.desc}</div>
            <div style="display:flex; gap:8px; margin-top:10px;">
                <button class="details-btn" data-commands="${d.commands.replace(/\n/g, '\\n')}" data-name="${d.name}" style="flex:1; background:#2a2a3a; border:1px solid #e8b44b; color:#e8b44b; padding:6px; border-radius:40px; cursor:pointer;">📜 Подробнее</button>
                <button class="buy-donate-btn" data-id="${d.id}" data-mode="${mode}" style="flex:1; background:#e8b44b; border:none; padding:6px; border-radius:40px; font-weight:bold; cursor:pointer;">Купить</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.onclick = () => {
            const commands = btn.dataset.commands.replace(/\\n/g, '\n');
            showDetails(commands, btn.dataset.name);
        };
    });

    document.querySelectorAll('.buy-donate-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const mode = btn.dataset.mode;
            const donate = donateData[mode].find(d => d.id === id);
            if (!donate) return;
            openPurchase({
                type: 'donate',
                name: donate.name,
                price: donate.price,
                desc: donate.desc,
                commands: donate.commands,
                mode: mode
            });
        };
    });
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        renderDonates(currentMode);
    };
});

const casesData = [
    { id: 'ore', name: 'Кейс с рудой', icon: 'ca/ru.jpeg', price: 35, type: 'ore', min: 50, max: 500 },
    { id: 'prefix', name: 'Кейс с префиксом', icon: 'ca/pr.jpeg', price: 20, type: 'prefix', prefixes: ['[RAIDER]', '[WARRIOR]', '[DRAGON]', '[GOD]', '[SHADOW]', '[BERSERK]', '[OVERLORD]', '[IMMORTAL]', '[PYRO]', '[TITAN]', '[AVENGER]', '[MAGISTER]', '[IMPERATOR]', '[NOMAD]', '[WANDERER]', '[SABOTEUR]', '[DESTROYER]', '[PHANTOM]', '[NIGHTFALL]', '[STARFALL]', '[VOIDWALKER]', '[ASHBRINGER]'] },
    { id: 'kit', name: 'Кейс с китом', icon: 'ca/ki.jpeg', price: 40, type: 'kit' },
    { id: 'items', name: 'Кейс с вещами', icon: 'ca/ve.jpeg', price: 15, type: 'items', items: ['Яйцо крипера', 'Зелье силы', 'Блок алмаза', 'Незерит', 'ТНТ', 'Обсидиан', 'Золотой блок', 'Жемчуг Эндера'] },
    { id: 'currency', name: 'Кейс с игровой валютой', icon: 'ca/va.jpeg', price: 22, type: 'currency', min: 40000, max: 2000000 },
    { id: 'donate_privilege', name: 'Кейс с донат-привилегией', icon: 'ca/do.jpeg', price: 27, type: 'donate_privilege' }
];

function showServerChoiceForCase(purchase) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        display: flex; justify-content: center; align-items: center;
        z-index: 6000; font-family: 'Orbitron', sans-serif;
    `;
    modal.innerHTML = `
        <div style="background: #1a1c2a; border: 2px solid #e8b44b; border-radius: 48px; padding: 30px; max-width: 400px; width: 90%; text-align: center;">
            <h2 style="color:#e8b44b;">⚔️ Выберите сервер</h2>
            <p style="color:#8a8a9a; margin:15px 0;">Для какого сервера открыть ${purchase.name}?</p>
            <div style="display:flex; gap:12px; margin:20px 0; flex-wrap:wrap; justify-content:center;">
                <button class="server-choice-case-btn" data-server="anarchy" style="flex:1; background:#1a1c2a; border:2px solid #ff3333; color:#ff3333; padding:12px 20px; border-radius:40px; font-weight:bold; cursor:pointer; min-width:120px;">🔥 Анархия</button>
                <button class="server-choice-case-btn" data-server="griefing" style="flex:1; background:#1a1c2a; border:2px solid #e8b44b; color:#e8b44b; padding:12px 20px; border-radius:40px; font-weight:bold; cursor:pointer; min-width:120px;">💀 Грифинг</button>
            </div>
            <button id="closeServerCaseChoice" style="background:#5a2a2a; border:none; padding:8px 20px; border-radius:40px; color:#ff8888; cursor:pointer;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.querySelectorAll('.server-choice-case-btn').forEach(btn => {
        btn.onclick = () => {
            const server = btn.dataset.server;
            document.querySelectorAll('.server-choice-case-btn').forEach(b => {
                b.style.background = '#1a1c2a';
                b.style.border = '2px solid #e8b44b';
                b.style.color = '#e8b44b';
            });
            if (server === 'anarchy') {
                btn.style.background = '#aa2222';
                btn.style.border = '2px solid #ff3333';
                btn.style.color = '#fff';
            } else {
                btn.style.background = '#e8b44b';
                btn.style.border = '2px solid #e8b44b';
                btn.style.color = '#0a0c12';
            }
            modal.remove();
            purchase.selectedServer = server;
            showCaseLocationChoice(purchase);
        };
    });

    document.getElementById('closeServerCaseChoice').onclick = () => {
        modal.remove();
        const data = userData[currentUser];
        data.rubles += purchase.price;
        saveUserData();
        updateUI();
    };
}

function showCaseLocationChoice(purchase) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        display: flex; justify-content: center; align-items: center;
        z-index: 5000; font-family: 'Orbitron', sans-serif;
    `;
    modal.innerHTML = `
        <div style="background: #1a1c2a; border: 2px solid #e8b44b; border-radius: 48px; padding: 30px; max-width: 400px; width: 90%; text-align: center;">
            <h2 style="color:#e8b44b;">🎯 Где открыть кейс?</h2>
            <p style="color:#8a8a9a; margin:15px 0;">Выберите место для открытия ${purchase.name}</p>
            <div style="display:flex; gap:12px; margin:20px 0; flex-wrap:wrap; justify-content:center;">
                <button class="case-location-btn" data-location="server" style="flex:1; background:#e8b44b; border:none; padding:12px 20px; border-radius:40px; font-weight:bold; cursor:pointer; min-width:120px;">🎮 На сервере</button>
                <button class="case-location-btn" data-location="site" style="flex:1; background:#1a1c2a; border:1px solid #e8b44b; color:#e8b44b; padding:12px 20px; border-radius:40px; font-weight:bold; cursor:pointer; min-width:120px;">🌐 На сайте</button>
            </div>
            <button id="closeCaseChoice" style="background:#5a2a2a; border:none; padding:8px 20px; border-radius:40px; color:#ff8888; cursor:pointer;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.querySelectorAll('.case-location-btn').forEach(btn => {
        btn.onclick = () => {
            const location = btn.dataset.location;
            modal.remove();
            if (location === 'server') {
                alert('🎮 Кейс будет открыт на сервере! Обратитесь к администратору.');
                const data = userData[currentUser];
                data.history.push({ type: `Открыт кейс ${purchase.name} x${purchase.quantity || 1} (сервер)`, price: purchase.price });
                saveUserData();
                updateUI();
            } else {
                startCaseAnimation(purchase);
            }
        };
    });

    document.getElementById('closeCaseChoice').onclick = () => {
        modal.remove();
        const data = userData[currentUser];
        data.rubles += purchase.price;
        saveUserData();
        updateUI();
    };
}

function startCaseAnimation(purchase) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); backdrop-filter: blur(8px);
        display: flex; justify-content: center; align-items: center;
        z-index: 5000; font-family: 'Orbitron', sans-serif;
    `;
    modal.innerHTML = `
        <div style="background: #1a1c2a; border: 2px solid #e8b44b; border-radius: 48px; padding: 30px; max-width: 650px; width: 95%; text-align: center;">
            <h2 style="color:#e8b44b;">🎰 Открытие ${purchase.name}</h2>
            <div id="caseSlotContainer" style="display:flex; justify-content:center; gap:15px; margin:25px 0; min-height:120px; flex-wrap:wrap;"></div>
            <div id="caseResultText" style="color:#ffd966; font-size:1.2rem; margin:15px 0;">Крутим...</div>
            <button id="closeCaseAnimation" style="background:#e8b44b; border:none; padding:10px 30px; border-radius:40px; font-weight:bold; cursor:pointer; margin-top:10px;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);

    const slotContainer = document.getElementById('caseSlotContainer');
    const resultText = document.getElementById('caseResultText');
    const closeBtn = document.getElementById('closeCaseAnimation');

    const caseData = casesData.find(c => c.id === purchase.caseId);
    if (!caseData) return;

    const results = [];
    const qty = purchase.quantity || 1;
    
    for (let q = 0; q < qty; q++) {
        let displayText = '';
        let color = '#ffd966';
        let emoji = '🎁';
        let resultData = { text: '', color: '', emoji: '' };
        
        if (caseData.type === 'ore') {
            const amount = Math.floor(Math.random() * (caseData.max - caseData.min + 1)) + caseData.min;
            userData[currentUser].ore += amount;
            displayText = `+${amount} руды`;
            color = '#ffaa44';
            emoji = '🪨';
            resultData = { text: displayText, color, emoji };
        } else if (caseData.type === 'prefix') {
            const prefix = caseData.prefixes[Math.floor(Math.random() * caseData.prefixes.length)];
            const colors = ['#ff4444', '#ff8844', '#ffcc44', '#44ff44', '#44ddff', '#8844ff', '#ff44ff', '#ffffff'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            displayText = prefix;
            color = randomColor;
            emoji = '🏷️';
            resultData = { text: displayText, color, emoji };
        } else if (caseData.type === 'kit') {
            const allDonates = [...donateData.anarchy, ...donateData.griefing];
            const randomDonate = allDonates[Math.floor(Math.random() * allDonates.length)];
            userData[currentUser].donations.push({ name: randomDonate.name, mode: purchase.selectedServer || 'kit', date: new Date().toLocaleDateString() });
            const colors = ['#ff6666', '#ffaa44', '#66ff66', '#44ddff', '#aa66ff', '#ff66ff', '#ffffff'];
            displayText = `Кит ${randomDonate.name}`;
            color = colors[Math.floor(Math.random() * colors.length)];
            emoji = '🎒';
            resultData = { text: displayText, color, emoji };
        } else if (caseData.type === 'items') {
            const item = caseData.items[Math.floor(Math.random() * caseData.items.length)];
            displayText = `Предмет: ${item}`;
            color = '#66ccff';
            emoji = '📦';
            resultData = { text: displayText, color, emoji };
        } else if (caseData.type === 'currency') {
            const amount = Math.floor(Math.random() * 1960000) + 40000;
            userData[currentUser].history.push({ type: `Игровая валюта +${amount}`, result: `${amount} монет` });
            displayText = `+${amount} монет`;
            color = '#ff66ff';
            emoji = '💎';
            resultData = { text: displayText, color, emoji };
        } else if (caseData.type === 'donate_privilege') {
            const server = purchase.selectedServer || 'anarchy';
            const donateList = donateData[server] || donateData.anarchy;
            const randomDonate = donateList[Math.floor(Math.random() * donateList.length)];
            userData[currentUser].donations.push({ name: randomDonate.name, mode: server, date: new Date().toLocaleDateString() });
            const colors = ['#ff4444', '#ff8844', '#ffcc44', '#44ff44', '#44ddff', '#8844ff', '#ff44ff', '#ffffff'];
            displayText = randomDonate.name;
            color = colors[Math.floor(Math.random() * colors.length)];
            emoji = '⚡';
            resultData = { text: displayText, color, emoji };
        }
        results.push(resultData);
    }

    results.forEach((r, idx) => {
        const slot = document.createElement('div');
        slot.className = 'case-slot';
        slot.style.cssText = `
            background: #0a0c12; border: 2px solid gold; border-radius: 20px;
            padding: 15px 20px; min-width: 100px; font-size: 1rem;
            text-align: center; transition: all 0.05s; margin: 5px;
            display: inline-block; color: #ffd966; font-weight: bold;
        `;
        slot.textContent = '🎁 ...';
        slot.id = `slot_${idx}`;
        slotContainer.appendChild(slot);
    });

    let reelItems = [];
    if (caseData.type === 'ore') {
        const amounts = ['+50 руды', '+100 руды', '+200 руды', '+350 руды', '+500 руды', '+75 руды', '+150 руды', '+300 руды'];
        reelItems = amounts;
    } else if (caseData.type === 'prefix') {
        reelItems = caseData.prefixes || ['[GOD]', '[DRAGON]', '[WARRIOR]', '[RAIDER]', '[SHADOW]'];
    } else if (caseData.type === 'kit') {
        const allDonates = [...donateData.anarchy, ...donateData.griefing];
        reelItems = allDonates.map(d => `Кит ${d.name}`);
    } else if (caseData.type === 'items') {
        reelItems = caseData.items || ['Яйцо крипера', 'Зелье силы', 'Блок алмаза', 'Незерит'];
    } else if (caseData.type === 'currency') {
        reelItems = ['+40 000 монет', '+100 000 монет', '+250 000 монет', '+500 000 монет', '+1 000 000 монет'];
    } else if (caseData.type === 'donate_privilege') {
        const allDonates = [...donateData.anarchy, ...donateData.griefing];
        reelItems = allDonates.map(d => d.name);
    }

    const colors = ['#ff4444', '#ff8844', '#ffcc44', '#44ff44', '#44ddff', '#8844ff', '#ff44ff', '#ffffff'];

    let spinCount = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10);

    function spinSlot() {
        if (spinCount >= totalSpins) {
            results.forEach((r, idx) => {
                const slot = document.getElementById(`slot_${idx}`);
                if (slot) {
                    slot.textContent = `${r.emoji} ${r.text}`;
                    slot.style.color = r.color;
                    slot.style.borderColor = '#4caf50';
                    slot.style.background = '#1a2a1a';
                    slot.style.fontSize = '1.1rem';
                }
            });
            const allResults = results.map(r => `${r.emoji} ${r.text}`).join('\n');
            resultText.innerHTML = `🎉 Результат:\n${allResults}`;
            resultText.style.color = '#aaffaa';
            closeBtn.style.display = 'inline-block';
            
            userData[currentUser].history.push({
                type: `Открыт кейс ${purchase.name} x${purchase.quantity || 1}`,
                price: purchase.price,
                result: allResults
            });
            saveUserData();
            updateUI();
            return;
        }

        spinCount++;
        document.querySelectorAll('.case-slot').forEach(slot => {
            const randomItem = reelItems[Math.floor(Math.random() * reelItems.length)];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            slot.textContent = randomItem;
            slot.style.color = randomColor;
            slot.style.fontSize = '1rem';
        });

        let delay = 50 + (spinCount / totalSpins) * 300;
        if (spinCount > totalSpins - 10) {
            delay = 150 + (spinCount / totalSpins) * 400;
        }
        setTimeout(spinSlot, delay);
    }

    closeBtn.style.display = 'none';
    setTimeout(spinSlot, 300);

    closeBtn.onclick = () => {
        modal.remove();
        renderCases();
        renderDonates(currentMode);
    };
}

function getCaseDetails(caseId) {
    const caseData = casesData.find(c => c.id === caseId);
    if (!caseData) return null;
    
    let details = { items: [], probabilities: [] };
    
    if (caseData.type === 'ore') {
        const ranges = [
            { min: 50, max: 150, prob: '40%' },
            { min: 151, max: 300, prob: '30%' },
            { min: 301, max: 450, prob: '20%' },
            { min: 451, max: 500, prob: '10%' }
        ];
        details.items = ranges.map(r => `${r.min}-${r.max} руды`);
        details.probabilities = ranges.map(r => r.prob);
    } else if (caseData.type === 'prefix') {
        const prefixes = caseData.prefixes || [];
        const prob = (100 / prefixes.length).toFixed(1) + '%';
        details.items = prefixes;
        details.probabilities = prefixes.map(() => prob);
    } else if (caseData.type === 'kit') {
        const allDonates = [...donateData.anarchy, ...donateData.griefing];
        const names = allDonates.map(d => `Кит ${d.name}`);
        const prob = (100 / names.length).toFixed(1) + '%';
        details.items = names;
        details.probabilities = names.map(() => prob);
    } else if (caseData.type === 'items') {
        const items = caseData.items || [];
        const prob = (100 / items.length).toFixed(1) + '%';
        details.items = items;
        details.probabilities = items.map(() => prob);
    } else if (caseData.type === 'currency') {
        const ranges = [
            { min: 40000, max: 200000, prob: '35%' },
            { min: 200001, max: 500000, prob: '30%' },
            { min: 500001, max: 1000000, prob: '20%' },
            { min: 1000001, max: 1500000, prob: '10%' },
            { min: 1500001, max: 2000000, prob: '5%' }
        ];
        details.items = ranges.map(r => `${r.min}-${r.max} монет`);
        details.probabilities = ranges.map(r => r.prob);
    } else if (caseData.type === 'donate_privilege') {
        const allDonates = [...donateData.anarchy, ...donateData.griefing];
        const names = allDonates.map(d => d.name);
        const prob = (100 / names.length).toFixed(1) + '%';
        details.items = names;
        details.probabilities = names.map(() => prob);
    }
    
    return details;
}

function showCaseDetails(caseId) {
    const details = getCaseDetails(caseId);
    if (!details) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        display: flex; justify-content: center; align-items: center;
        z-index: 7000; font-family: 'Orbitron', sans-serif;
    `;
    
    let itemsHtml = '';
    for (let i = 0; i < details.items.length; i++) {
        itemsHtml += `<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #2a2a3a;">
            <span style="color:#ffd966;">${details.items[i]}</span>
            <span style="color:#44ff44;">${details.probabilities[i]}</span>
        </div>`;
    }
    
    modal.innerHTML = `
        <div style="background: #1a1c2a; border: 2px solid #e8b44b; border-radius: 48px; padding: 30px; max-width: 450px; width: 90%; text-align: center;">
            <h2 style="color:#e8b44b;">📊 Шансы выпадения</h2>
            <div style="margin:20px 0; text-align:left; max-height:300px; overflow-y:auto;">
                ${itemsHtml}
            </div>
            <button id="closeDetailsBtn" style="background:#e8b44b; border:none; padding:10px 30px; border-radius:40px; font-weight:bold; cursor:pointer;">Закрыть</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('closeDetailsBtn').onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function renderCases() {
    const grid = document.getElementById('casesGrid');
    grid.innerHTML = '';
    casesData.forEach(c => {
        const card = document.createElement('div');
        card.className = 'case-card';
        card.innerHTML = `
            <div class="case-icon"><img src="${c.icon}" alt="${c.name}" style="width:80px; height:80px; object-fit:contain;"></div>
            <h3>${c.name}</h3>
            <div class="price">💰 ${c.price} ₽</div>
            <div style="display:flex; gap:6px; margin-top:10px; align-items:center; justify-content:center; flex-wrap:wrap;">
                <input type="number" class="case-quantity" id="qty_${c.id}" value="1" min="1" max="10" style="width:50px; background:#1f1c14; border:1px solid #e8b44b; border-radius:40px; padding:4px 8px; text-align:center; color:#ffd966;">
                <button class="open-case-btn" data-id="${c.id}" style="background:#e8b44b; border:none; padding:6px 16px; border-radius:40px; font-weight:bold; cursor:pointer;">Купить и открыть</button>
                <button class="details-case-btn" data-id="${c.id}" style="background:#2a2a3a; border:1px solid #e8b44b; color:#e8b44b; padding:6px 16px; border-radius:40px; font-weight:bold; cursor:pointer;">📊</button>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.open-case-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const caseData = casesData.find(c => c.id === id);
            if (!caseData) return;
            const qty = parseInt(document.getElementById(`qty_${id}`).value) || 1;
            if (qty < 1 || qty > 10) { alert('Количество от 1 до 10'); return; }
            openPurchase({
                type: 'case',
                name: caseData.name,
                price: caseData.price * qty,
                desc: `${caseData.name} x${qty}`,
                caseId: caseData.id,
                quantity: qty
            });
        };
    });
    
    document.querySelectorAll('.details-case-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            showCaseDetails(id);
        };
    });
}

const specialData = [
    { id: 'special_prefix', name: 'Кейс с префиксом (навсегда)', icon: 'ca/pr.jpeg', price: 70, currency: 'gold', desc: 'Случайный префикс навсегда' },
    { id: 'special_donate', name: 'Кейс с донат-привилегией', icon: 'ca/do.jpeg', price: 90, currency: 'emerald', desc: 'Случайная привилегия' },
    { id: 'special_currency', name: 'Кейс с игровой валютой', icon: 'ca/va.jpeg', price: 60, currency: 'diamond', desc: 'Случайное количество монет (40 000 – 2 000 000)' },
    { id: 'special_promo', name: 'Рандомный промокод на скидку', icon: 'ca/pro.jpeg', price: 37, currency: 'diamond', desc: 'Случайный промокод на скидку 10-50%' }
];

function renderSpecial() {
    const grid = document.getElementById('specialGrid');
    grid.innerHTML = '';
    const data = userData[currentUser];
    if (!data.specialCooldowns) data.specialCooldowns = {};

    specialData.forEach(s => {
        const lastBuy = data.specialCooldowns[s.id] || 0;
        const now = Date.now();
        const canBuy = now - lastBuy > 24 * 3600 * 1000;
        const remaining = 24 * 3600 * 1000 - (now - lastBuy);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);

        const card = document.createElement('div');
        card.className = 'special-card';
        const currencyIcon = s.currency === 'gold' ? '🥇' : (s.currency === 'diamond' ? '💎' : '📿');
        card.innerHTML = `
            <div class="special-icon"><img src="${s.icon}" alt="${s.name}" style="width:80px; height:80px; object-fit:contain;"></div>
            <h3>${s.name}</h3>
            <div class="special-price">${currencyIcon} ${s.price} ${s.currency}</div>
            <div class="special-desc">${s.desc}</div>
            <button class="buy-special-btn" data-id="${s.id}" ${canBuy ? '' : 'disabled style="opacity:0.5;"'}>
                ${canBuy ? 'Купить' : `⏳ ${hours}ч ${minutes}м`}
            </button>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.buy-special-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const special = specialData.find(s => s.id === id);
            if (!special) return;
            const data = userData[currentUser];
            const now = Date.now();
            if (now - (data.specialCooldowns?.[id] || 0) < 24 * 3600 * 1000) {
                alert('Это предложение можно купить только раз в день!');
                return;
            }
            const currencyMap = { gold: 'gold', diamond: 'diamond', emerald: 'emerald' };
            const currencyKey = currencyMap[special.currency];
            if (data[currencyKey] < special.price) {
                alert(`Недостаточно ${special.currency}! Соберите ресурсы.`);
                return;
            }
            data[currencyKey] -= special.price;
            if (!data.specialCooldowns) data.specialCooldowns = {};
            data.specialCooldowns[id] = now;

            let result = '';
            if (special.id === 'special_prefix') {
                const prefixes = ['[RAIDER]', '[WARRIOR]', '[DRAGON]', '[GOD]', '[SHADOW]', '[BERSERK]', '[OVERLORD]', '[IMMORTAL]', '[PYRO]', '[TITAN]', '[AVENGER]', '[MAGISTER]', '[IMPERATOR]', '[NOMAD]', '[WANDERER]', '[SABOTEUR]', '[DESTROYER]', '[PHANTOM]', '[NIGHTFALL]', '[STARFALL]', '[VOIDWALKER]', '[ASHBRINGER]'];
                const p = prefixes[Math.floor(Math.random() * prefixes.length)];
                result = `🎉 Вы получили префикс ${p} НАВСЕГДА!`;
            } else if (special.id === 'special_donate') {
                const purchase = { type: 'special', specialId: 'special_donate', price: special.price };
                showServerChoiceForSpecial(purchase);
                return;
            } else if (special.id === 'special_currency') {
                const amount = Math.floor(Math.random() * 1960000) + 40000;
                data.history.push({ type: `Игровая валюта +${amount}`, result: `${amount} монет` });
                result = `🎉 Вы получили ${amount} игровых монет!`;
            } else if (special.id === 'special_promo') {
                const discounts = [10, 15, 20, 25, 30, 40, 50];
                const disc = discounts[Math.floor(Math.random() * discounts.length)];
                const discountDecimal = disc / 100;
                const promoCode = 'PROMO' + Math.random().toString(36).substring(2, 8).toUpperCase();
                
                // Сохраняем промокод
                activePromoCodes[promoCode] = discountDecimal;
                savePromoCodes();
                
                result = `🎉 Промокод: ${promoCode} на скидку ${disc}%! Используйте при покупке.`;
                data.history.push({ type: `Получен промокод ${promoCode}`, disc });
                // Сохраняем в историю пользователя
                if (!data.promoCodes) data.promoCodes = [];
                data.promoCodes.push({ code: promoCode, discount: disc, used: false });
            }
            data.history.push({ type: `Спецпредложение: ${special.name}`, result });
            saveUserData();
            updateUI();
            renderSpecial();
            showReceipt(`🎉 ${result}`);
        };
    });
}

function showServerChoiceForSpecial(purchase) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        display: flex; justify-content: center; align-items: center;
        z-index: 6000; font-family: 'Orbitron', sans-serif;
    `;
    modal.innerHTML = `
        <div style="background: #1a1c2a; border: 2px solid #e8b44b; border-radius: 48px; padding: 30px; max-width: 400px; width: 90%; text-align: center;">
            <h2 style="color:#e8b44b;">⚔️ Выберите сервер</h2>
            <p style="color:#8a8a9a; margin:15px 0;">Для какого сервера активировать привилегию?</p>
            <div style="display:flex; gap:12px; margin:20px 0; flex-wrap:wrap; justify-content:center;">
                <button class="server-choice-special-btn" data-server="anarchy" style="flex:1; background:#1a1c2a; border:2px solid #ff3333; color:#ff3333; padding:12px 20px; border-radius:40px; font-weight:bold; cursor:pointer; min-width:120px;">🔥 Анархия</button>
                <button class="server-choice-special-btn" data-server="griefing" style="flex:1; background:#1a1c2a; border:2px solid #e8b44b; color:#e8b44b; padding:12px 20px; border-radius:40px; font-weight:bold; cursor:pointer; min-width:120px;">💀 Грифинг</button>
            </div>
            <button id="closeServerSpecialChoice" style="background:#5a2a2a; border:none; padding:8px 20px; border-radius:40px; color:#ff8888; cursor:pointer;">Отмена</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.querySelectorAll('.server-choice-special-btn').forEach(btn => {
        btn.onclick = () => {
            const server = btn.dataset.server;
            document.querySelectorAll('.server-choice-special-btn').forEach(b => {
                b.style.background = '#1a1c2a';
                b.style.border = '2px solid #e8b44b';
                b.style.color = '#e8b44b';
            });
            if (server === 'anarchy') {
                btn.style.background = '#aa2222';
                btn.style.border = '2px solid #ff3333';
                btn.style.color = '#fff';
            } else {
                btn.style.background = '#e8b44b';
                btn.style.border = '2px solid #e8b44b';
                btn.style.color = '#0a0c12';
            }
            modal.remove();
            completeSpecialDonatePurchase(server);
        };
    });

    document.getElementById('closeServerSpecialChoice').onclick = () => {
        modal.remove();
        const data = userData[currentUser];
        const special = specialData.find(s => s.id === 'special_donate');
        const currencyMap = { gold: 'gold', diamond: 'diamond', emerald: 'emerald' };
        const currencyKey = currencyMap[special.currency];
        data[currencyKey] += special.price;
        saveUserData();
        updateUI();
    };
}

function completeSpecialDonatePurchase(server) {
    const data = userData[currentUser];
    if (!data) return;

    const donateList = donateData[server] || donateData.anarchy;
    const randomDonate = donateList[Math.floor(Math.random() * donateList.length)];
    
    data.donations.push({ 
        name: randomDonate.name, 
        mode: server, 
        date: new Date().toLocaleDateString() 
    });
    data.history.push({ 
        type: `Спецпредложение: ${randomDonate.name} (${server === 'anarchy' ? 'Анархия' : 'Грифинг'})`, 
        price: 'спец' 
    });
    
    showReceipt(`🎉 Вы получили привилегию ${randomDonate.name} для сервера ${server === 'anarchy' ? 'Анархия' : 'Грифинг'}!\nКоманды: ${randomDonate.commands.split('\n')[0]}`);
    
    saveUserData();
    updateUI();
    renderSpecial();
}

function startSpecialTimers() {
    setInterval(() => {
        if (document.getElementById('specialTab').classList.contains('active')) {
            renderSpecial();
        }
    }, 60000);
}

function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = document.getElementById('heroPreview');
    if (!hero) return;
    
    let width, height;
    let particles = [];
    const particleCount = 100;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    function resize() {
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width;
        canvas.height = height;
    }

    function createParticles() {
        particles = [];
        const colors = ['#e8b44b', '#ffd966', '#ffaa44', '#ffcc88', '#ffdd99', '#ff8800'];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 4 + 2,
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: (Math.random() - 0.5) * 0.15,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.7 + 0.2,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        
        const dx = currentX * 0.02;
        const dy = currentY * 0.02;
        
        for (let p of particles) {
            p.x += p.speedX + dx * 0.1;
            p.y += p.speedY + dy * 0.1;
            
            p.x += (p.baseX - p.x) * 0.0003;
            p.y += (p.baseY - p.y) * 0.0003;
            
            if (p.x < 0) { p.x = width; p.baseX = width; }
            if (p.x > width) { p.x = 0; p.baseX = 0; }
            if (p.y < 0) { p.y = height; p.baseY = height; }
            if (p.y > height) { p.y = 0; p.baseY = 0; }
            
            for (let j = 0; j < particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    const alpha = 0.06 * (1 - dist / 120) * (0.5 + Math.abs(Math.sin(Date.now() / 2000 + p.phase)));
                    ctx.strokeStyle = `rgba(232, 180, 75, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
            
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            glow.addColorStop(0, p.color);
            glow.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.globalAlpha = 0.15;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowColor = '#e8b44b';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        requestAnimationFrame(drawParticles);
    }

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left - width / 2;
        targetY = e.clientY - rect.top - height / 2;
    });

    hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    hero.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = hero.getBoundingClientRect();
        targetX = touch.clientX - rect.left - width / 2;
        targetY = touch.clientY - rect.top - height / 2;
    }, { passive: false });

    hero.addEventListener('touchend', () => {
        targetX = 0;
        targetY = 0;
    });

    hero.addEventListener('touchcancel', () => {
        targetX = 0;
        targetY = 0;
    });

    resize();
    createParticles();
    drawParticles();
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
}

function initCustomCursor() {
    if (window.innerWidth < 768) return;
    if (document.querySelector('.custom-cursor')) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-cursor', 'true');
    style.textContent = `
        * { cursor: none !important; }
        .custom-cursor {
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            width: 32px;
            height: 32px;
            border: 2px solid #e8b44b;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(232,180,75,0.2), transparent 70%);
            box-shadow: 0 0 20px rgba(232,180,75,0.3), inset 0 0 10px rgba(232,180,75,0.2);
            transform: translate(-50%, -50%);
            transition: width 0.15s, height 0.15s, background 0.2s;
        }
        .custom-cursor::after {
            content: '+';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #e8b44b;
            font-size: 16px;
            font-weight: 100;
            text-shadow: 0 0 10px rgba(232,180,75,0.5);
        }
        .custom-cursor.active {
            width: 44px;
            height: 44px;
            background: radial-gradient(circle, rgba(232,180,75,0.4), transparent 70%);
        }
        .custom-cursor.active::after {
            font-size: 20px;
            color: #ffd966;
        }
    `;
    document.head.appendChild(style);
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        const target = e.target;
        const isInteractive = target.closest('button') || target.closest('a') || target.closest('.game-card') || target.closest('.donate-card') || target.closest('.case-card') || target.closest('.auth-btn') || target.closest('.buy-btn') || target.closest('.nav-tab');
        if (isInteractive) {
            cursor.classList.add('active');
        } else {
            cursor.classList.remove('active');
        }
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

function startCollecting() {
    const area = document.getElementById('collectArea');
    const resources = ['🥇', '💎', '📿'];
    const names = ['gold', 'diamond', 'emerald'];
    const displayNames = ['золото', 'алмазы', 'изумруды'];

    setInterval(() => {
        if (!document.getElementById('collectTab').classList.contains('active')) return;
        const item = document.createElement('div');
        item.className = 'collect-item';
        const idx = Math.floor(Math.random() * resources.length);
        
        const isMobile = window.innerWidth < 768;
        const size = isMobile ? 70 : 55;
        const fontSize = isMobile ? '3.5rem' : '2.8rem';
        
        item.style.cssText = `
            position: absolute;
            font-size: ${fontSize};
            cursor: pointer;
            user-select: none;
            animation: floatDown ${5 + Math.random() * 5}s linear forwards;
            left: ${Math.random() * 90 + '%'};
            z-index: 100;
            filter: drop-shadow(0 0 15px rgba(232,180,75,0.4));
            transition: transform 0.1s;
        `;
        item.innerHTML = `<img src="${idx === 0 ? 'logotips/zo.jpg' : idx === 1 ? 'logotips/al.jpg' : 'logotips/iz.jpg'}" style="width:${size}px; height:${size}px; object-fit:contain; display:block; border-radius:12px; background:rgba(0,0,0,0.3); padding:6px;">`;
        item.dataset.type = names[idx];
        
        item.onclick = (e) => {
            e.stopPropagation();
            const data = userData[currentUser];
            if (data) {
                data[names[idx]] = (data[names[idx]] || 0) + 1;
                saveUserData();
                updateUI();
                const msg = document.createElement('div');
                msg.textContent = `+1 ${displayNames[idx]}`;
                msg.style.cssText = `position:fixed; color:#e8b44b; font-weight:bold; font-size:${isMobile ? '1.8rem' : '1.2rem'}; pointer-events:none; z-index:5000; text-shadow:0 0 20px rgba(0,0,0,0.8);`;
                msg.style.left = (e.clientX || window.innerWidth/2) + 'px';
                msg.style.top = (e.clientY || window.innerHeight/2) + 'px';
                msg.style.animation = 'fadeIn 0.5s forwards';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 800);
            }
            item.remove();
        };
        
        item.ontouchstart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const data = userData[currentUser];
            if (data) {
                data[names[idx]] = (data[names[idx]] || 0) + 1;
                saveUserData();
                updateUI();
                const msg = document.createElement('div');
                msg.textContent = `+1 ${displayNames[idx]}`;
                msg.style.cssText = `position:fixed; color:#e8b44b; font-weight:bold; font-size:${isMobile ? '1.8rem' : '1.2rem'}; pointer-events:none; z-index:5000; text-shadow:0 0 20px rgba(0,0,0,0.8);`;
                msg.style.left = touch.clientX + 'px';
                msg.style.top = (touch.clientY - 20) + 'px';
                msg.style.animation = 'fadeIn 0.5s forwards';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 800);
            }
            item.remove();
        };
        
        area.appendChild(item);
        setTimeout(() => {
            if (item.parentNode) item.remove();
        }, 10000);
    }, 900);
}

function renderLeaders() {
    const list = document.getElementById('leadersList');
    const sorted = Object.entries(userData)
        .map(([name, data]) => ({ name, ore: data.ore, rubles: data.rubles }))
        .sort((a, b) => b.ore - a.ore)
        .slice(0, 10);
    list.innerHTML = '';
    sorted.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = 'leader-item';
        div.innerHTML = `<span>#${i+1} ${u.name}</span><span>🪨 ${u.ore} | 💰 ${u.rubles}₽</span>`;
        list.appendChild(div);
    });
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    const data = userData[currentUser];
    if (!data || !data.history) return;
    data.history.slice().reverse().forEach(h => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${h.type}</span> <span>${h.price !== undefined ? h.price + ' ₽' : (h.result || '')}</span>`;
        list.appendChild(div);
    });
}

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
        if (tab.dataset.tab === 'special') renderSpecial();
        if (tab.dataset.tab === 'leaders') renderLeaders();
    };
});

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    
    const casesBtn = document.getElementById('casesScrollBtn');
    if (casesBtn) {
        casesBtn.addEventListener('click', () => {
            const casesTab = document.getElementById('casesTab');
            if (casesTab) {
                casesTab.scrollIntoView({ behavior: 'smooth' });
                document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
                document.querySelector('.nav-tab[data-tab="cases"]').classList.add('active');
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                document.getElementById('casesTab').classList.add('active');
            }
        });
    }
    const startBtn = document.querySelector('.preview-btn:not(.secondary)');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const donateTab = document.getElementById('donateTab');
            if (donateTab) {
                donateTab.scrollIntoView({ behavior: 'smooth' });
                document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
                document.querySelector('.nav-tab[data-tab="donate"]').classList.add('active');
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                document.getElementById('donateTab').classList.add('active');
            }
        });
    }
});

setInterval(() => {
    if (!document.querySelector('.custom-cursor') && window.innerWidth >= 768) {
        initCustomCursor();
    }
}, 3000);

startCollecting();
