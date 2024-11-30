"use strict"
//==========================================
import { ERROR_SERVER, NO_ITEMS_CART } from './constants.js';
import { 
    showErrorMessage,
    setBasketLocalStorage,
    getBasketLocalStorage,
    checkingRelevanceValueBasket
} from './utils.js';
const sum = document.querySelector('.sum');
const cart = document.querySelector('.cart');
let productsData = [];

getProducts();
cart.addEventListener('click', delProductBasket);


async function getProducts() {
    try {

        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText)
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
        showErrorMessage(ERROR_SERVER)
        return;
    }

    checkingRelevanceValueBasket(data);
    const basket = getBasketLocalStorage();

    if(!basket || !basket.length) {
        showErrorMessage(NO_ITEMS_CART)
        return;
    }

    const findProducts = data.filter(item => basket.includes(String(item.id)));

    if(!findProducts.length) {
        showErrorMessage(NO_ITEMS_CART)
        return;
    }

    renderProductsBasket(findProducts);
}

function delProductBasket(event) {
    refreshPage();
    const targetButton = event.target.closest('.cart__del-card');
    if (!targetButton) return;

    const card = targetButton.closest('.cart__product');
    const id = card.dataset.productId;
    const basket = getBasketLocalStorage();

    const newBasket = basket.filter(item => item !== id);
    setBasketLocalStorage(newBasket);

    getProducts();
    refreshPage();
    
}

function refreshPage() {
    location.reload();
}

function renderProductsBasket(arr) {
    let summa = 0;
    let summa1 = 0;
    let summa2 = 0;
    arr.forEach(card => {
        const { id, img, title, price, discount } = card;
        const priceDiscount = price - ((price * discount) / 100);
        const rubl = priceDiscount * 98;
        const smn = priceDiscount * 10.7;
        summa += Number(priceDiscount)
        summa1 += Number(priceDiscount) * 98
        summa2 += Number(priceDiscount) * 10.7
        
        const cardItem = 
        `
        <div class="cart__product" data-product-id="${id}">
            <div class="cart__img">
                <img src="./images/${img}" alt="${title}">
            </div>
            <div style="display: flex ;flex-direction: column; row-gap: 6px; font-weight: bold;" class="cart__price-discount">
            <span style="color:red;">Цена:</span>
            <span>${priceDiscount}$</span>
            <span>${rubl.toFixed(1)}₽</span>
            <span>${smn.toFixed(1)}смн</span>
            </div>
            <div class="cart__del-card">X</div>
        </div>
        `;
        
        cart.insertAdjacentHTML('beforeend', cardItem);
    });
    const sumItem = `<span>сомони: ${summa2.toFixed(1)}смн</span><span>доллар: ${summa.toFixed(1)}$</span><span>рубль: ${summa1.toFixed(1)}₽</span>`
    sum.insertAdjacentHTML('beforeend', sumItem);

}