"use strict";

import { ERROR_SERVER, NO_ITEMS_CART } from './constants.js';
import { 
    showErrorMessage,
    setBasketLocalStorage,
    getBasketLocalStorage,
    checkingRelevanceValueBasket
} from './utils.js';

const cart = document.querySelector('.cart');
let productsData = [];

async function getProducts() {
    try {
        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            productsData = await res.json();
        }

        loadProductBasket(productsData);
    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}

function loadProductBasket(data) {
    cart.textContent = '';

    if (!data || !data.length) {
        showErrorMessage(ERROR_SERVER);
        return;
    }

    checkingRelevanceValueBasket(data);
    const basket = getBasketLocalStorage();

    if (!basket || !basket.length) {
        showErrorMessage(NO_ITEMS_CART);
        return;
    }

    const findProducts = data.filter(item => basket.includes(String(item.id)));

    if (!findProducts.length) {
        showErrorMessage(NO_ITEMS_CART);
        return;
    }

    renderProductsBasket(findProducts);
}

function delProductBasket(event) {
    const targetButton = event.target.closest('.cart__del-card');
    if (!targetButton) return;

    const card = targetButton.closest('.cart__product');
    const id = card.dataset.productId;
    const basket = getBasketLocalStorage();

    const newBasket = basket.filter(item => item !== id);
    setBasketLocalStorage(newBasket);

    getProducts();
}

function renderProductsBasket(arr) {
    arr.forEach(card => {
        const { id, img, title } = card;

        const cardItem = `
        <div class="cart__product" data-product-id="${id}">
            <div class="cart__img">
                <img src="./images/${img}" alt="${title}">
            </div>
            <input class="title" type="text" value="${title}">
        </div>
        `;

        cart.insertAdjacentHTML('beforeend', cardItem);

        // Отправка сообщения в Telegram
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: title
            })
        }).then(response => response.json())
          .then(data => console.log('Message sent: ', data))
          .catch(error => console.error('Error sending message: ', error));
    });
}

// Идентификатор вашего чата в Telegram
const chatId = '5252214082';
// Ваш токен бота в Telegram
const botToken = '7059960789:AAG23wRmYE9fWT3dUG9WjVOh_ffdXN6ebmc';

document.querySelector('#applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Получение данных формы
    const formData = new FormData(this);
    const fullName = formData.get('fullName');
    const phoneNumber = formData.get('phoneNumber');
    const fileInput = formData.get('fileInput');
    const address = formData.get('address');
    const comment = formData.get('comment');

    // Создание сообщения
    const message = `ФИО: ${fullName}\nНомер телефона: ${phoneNumber}\nАдрес доставки: ${address}\nКомментарий: ${comment}`;

    // Отправка сообщения в Telegram
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    }).then(response => response.json())
      .then(data => {
          console.log('Message sent: ', data);
          // Удаление данных из корзины
          setBasketLocalStorage([]);

          // Блокировка страницы на 3 часа
          localStorage.setItem('basketLocked', 'true');
          localStorage.setItem('basketLockedTime', Date.now());

          window.location.href = 'index.html';
      })
      .catch(error => console.error('Error sending message: ', error));

    if (fileInput) {
        const fileFormData = new FormData();
        fileFormData.append('chat_id', chatId);
        fileFormData.append('document', fileInput);

        fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: fileFormData
        }).then(response => response.json())
          .then(data => alert("Заявка успешно отправлена в Telegram!"))
          .catch(error => console.error('Error sending document: ', error));
    }
});

// Проверка блокировки корзины
document.addEventListener('DOMContentLoaded', () => {
    const basketLocked = localStorage.getItem('basketLocked');
    const basketLockedTime = localStorage.getItem('basketLockedTime');
    const lockDuration = 3 * 60 * 60 * 1000; // 3 часа в миллисекундах

    if (basketLocked === 'true' && (Date.now() - basketLockedTime) < lockDuration) {
        alert('Корзина заблокирована на 3 часа.');
        document.body.innerHTML = '<h1>Ваша заявка на расматрение, наши менеджера свяжутся с вами.</h1>';
    } else {
        // Убираем блокировку после 3 часов
        localStorage.removeItem('basketLocked');
        localStorage.removeItem('basketLockedTime');
        getProducts();
    }
});
