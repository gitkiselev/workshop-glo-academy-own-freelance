document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const customer = document.getElementById('customer'); 
    const freelancer = document.getElementById('freelancer');
    const blockCustomer = document.getElementById('block-customer');
    const blockFreelancer = document.getElementById('block-freelancer');
    const blockChoice = document.getElementById('block-choice');
    const btnExit = document.getElementById('btn-exit');
    const formCustomer = document.getElementById('form-customer');
    const ordersTable = document.getElementById('orders');
    const modalOrder = document.getElementById('order_read');
    const modalOrderActive = document.getElementById('order_active');
    const headTable = document.getElementById('headTable');
    
    const orders = JSON.parse(localStorage.getItem('freeOrders')) || [];

    const toStorage = () => {
        localStorage.setItem('freeOrders', JSON.stringify(orders))
    }

    const declOfNum = (number, titles) => number + ' ' + titles[(number % 100 > 4 && number % 100 < 20)
         ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];
    const calcDeadline = (date) => {
        // const diff = Date.parse(deadline) - Date.now();
        // const daysDiff = Math.floor(diff / (1000 * 3600 * 24));
        // function declOfNum(number, titles) {  
        //     const cases = [2, 0, 1, 1, 1, 2];  
        //     return number +  ' ' + titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
        // }
        // return declOfNum(daysDiff, ['день', 'дня', 'дней']);//1, 2, 5
        const deadline = new Date(date);
        const toDay = Date.now();

        const remaining = (deadline - toDay) / 1000 / 60 / 60;
        if (remaining / 24 > 2) {
            return declOfNum(Math.floor(remaining / 24), ['день', 'дня', 'дней'])
        }
        return declOfNum(Math.floor(remaining), ['час', 'часа', 'часов']);
    }
    const renderOrders = () => {
        ordersTable.textContent = '';
        orders.forEach((order, i) => {
            ordersTable.innerHTML +=`
            <tr class="order ${order.active ? 'taken' : ''}"
                data-number-order="${i}">
                <td>${i + 1}</td>
                <td>${order.title}</td>
                <td class="${order.currency}"></td>
                <td>${calcDeadline(order.deadline)}</td>
            </tr>`;
        });
        
    }

    const handlerModal = e => {
        const target = e.target;
        const modal  = target.closest('.order-modal');
        const order = orders[modal.id];
        const baseAction = () => {
            modal.style.display = 'none';
            toStorage();
            renderOrders();
        }
        if (target.closest('.close') || target === modal) {
            modal.style.display = 'none';
        }

        if (target.classList.contains('get-order')) {
            order.active = true;
            baseAction()
        }
        if (target.id === 'capitulation') {
            order.active = false;
            baseAction()
        }

        if (target.id === 'ready') {
            orders.splice(orders.indexOf(order), 1)
            baseAction()
        }
    }
    const openModal = (numberOrder) => {
        const order = orders[numberOrder];
        let { title, firstName, email, description, deadline, currency, amount, phone, active = false } = order;
        const modal = active ? modalOrderActive : modalOrder;
        
        
        const firstNameBlock = modal.querySelector('.firstName');
        const titleBlock = modal.querySelector('.modal-title');
        const emailBlock = modal.querySelector('.email');
        const descriptionBlock = modal.querySelector('.description');
        const deadlineBlock = modal.querySelector('.deadline');
         
        const currencyBlock = modal.querySelector('.currency_img');
        const countBlock = modal.querySelector('.count');
        const phoneBlock = modal.querySelector('.phone');

        modal.id = numberOrder;
        titleBlock.textContent = title;
        firstNameBlock.textContent = firstName;
        emailBlock.textContent = email;
        emailBlock.setAttribute('href', `mailto: ${email}`);
        descriptionBlock.textContent = description;
        deadlineBlock.textContent = calcDeadline(deadline);
        currencyBlock.className = 'currency_img';
        currencyBlock.classList.add(currency);
        countBlock.textContent = amount;
        phoneBlock && (phoneBlock.href = 'tel:' + phone)

        modal.style.display = 'flex';

        modal.addEventListener('click', handlerModal);
    }
    const sortOrder = (arr, property) => {
        arr.sort((a, b) => a[property] > b[property] ? 1 : -1)
    }

    headTable.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('head-sort')) {
            if (target.id === 'taskSort') {
                sortOrder(orders, 'title');
            }
            if (target.id === 'currencySort') {
                sortOrder(orders, 'currency');
            }
            if (target.id === 'deadlineSort') {
                sortOrder(orders, 'deadline');
            }
            toStorage();
            renderOrders();
        }
    })
    ordersTable.addEventListener('click', (e) => {
        const target = e.target;
        const targetOrder = target.closest('.order')
        if (targetOrder) {
            openModal(targetOrder.dataset.numberOrder);
        }
        console.log(orders[targetOrder.dataset.numberOrder]);
    })

    customer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        const toDay = new Date().toISOString().substring(0, 10);
        document.getElementById('deadline').min = toDay;
        blockCustomer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    freelancer.addEventListener('click', () => {
        blockChoice.style.display = 'none';
        renderOrders();
        blockFreelancer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    btnExit.addEventListener('click', () => {
        btnExit.style.display = 'none';
        blockCustomer.style.display = 'none';
        blockFreelancer.style.display = 'none';
        blockChoice.style.display = 'block';
    })

    formCustomer.addEventListener('submit', (e) => {
        e.preventDefault();
        const obj = {};
        // for (const elem of formCustomer.elements) {
        //     if ((elem.tagName === 'INPUT' && elem.type !== 'radio') ||
        //     elem.type === 'radio' && elem.checked || elem.tagName === 'TEXTAREA') {
        //         obj[elem.name] = elem.value;

        //         if (elem.type !== 'radio') {
        //             elem.value = ''
        //         }
        //     }
        // }
        const filterFields = elem => {
            const result = (elem.tagName === 'INPUT' && elem.type !== 'radio') ||
             (elem.type === 'radio' && elem.checked) ||
              (elem.tagName === 'TEXTAREA')
              return result;
        }
        const formElements = [...formCustomer.elements].filter(filterFields);
        formElements.forEach(elem => obj[elem.name] = elem.value)
        orders.push(obj);
        toStorage();
        formCustomer.reset();
    })


    
});