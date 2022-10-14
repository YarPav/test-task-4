const data = {
    directions: [
        {
            label: 'из A в B',
            direction: 'ab',
            times: [
                '2021-08-21 18:00 GMT+0300',
                '2021-08-21 18:30 GMT+0300',
                '2021-08-21 18:45 GMT+0300',
                '2021-08-21 19:00 GMT+0300',
                '2021-08-21 19:15 GMT+0300',
                '2021-08-21 21:00 GMT+0300'
            ]
        },
        {
            label: 'из B в A',
            direction: 'ba',
            times: [
                '2021-08-21 18:30 GMT+0300',
                '2021-08-21 18:45 GMT+0300',
                '2021-08-21 19:00 GMT+0300',
                '2021-08-21 19:15 GMT+0300',
                '2021-08-21 19:35 GMT+0300',
                '2021-08-21 21:50 GMT+0300',
                '2021-08-21 22:55 GMT+0300'
            ]
        },
        {
            label: 'из A в B и обратно в А',
            direction: 'aba',
            times: []
        }
    ],
    selectedDirection: 0
};

const TIME_IN_WAY = 50,
    SINGLE_PRICE = 700,
    REVERSE_PRICE = 1200;

const directionInput = document.querySelector('#direction'),
    timeInput = document.querySelector('#time'),
    timeReverseInput = document.querySelector('#time-reverse'),
    ticketsCount = document.querySelector('#num'),
    answerElement = document.querySelector('.answer'),
    form = document.querySelector('#form');


// Вспомогательные функции
const insertOptions = (parent, options) => {
    parent.insertAdjacentHTML('beforeend', options.join(''));
}
const getTimeOption = (index) => {
    return data.directions[index].times.map(time => `<option value="${time}">${formatDate(time)} (${data.directions[index].label})</option>`);
}
const datesAddition = (date) => {
    date = new Date(date);
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes() + TIME_IN_WAY);
}
const formatDate = (date) => {
    const newDate = new Date(date);
    let minutes = newDate.getMinutes(),
        hours = newDate.getHours();
    if (newDate.getMinutes().toString().length === 1) {
        minutes = '0' + minutes;
    }
    if (newDate.getHours().toString().length === 1) {
        hours = '0' + hours;
    }
    return hours + ':' + minutes;
}
const insertTimeOptions = (index = 0) => {
    timeInput.innerHTML = '';
    insertOptions(timeInput, getTimeOption(index));
}
const onReverseDirectionSelect = () => {
    const date = new Date(data.directions[0].times[0]);
    insertTimeReverseOptions(1, datesAddition(date).getTime());
    timeInput.addEventListener('change', timeInputChangeListener);
}


// Функции формирования селектов
const insertTimeReverseOptions = (index = 1, arrivalTime = null, isFirst = true) => {
    if (isFirst) insertTimeOptions();
    timeReverseInput.classList.remove('hidden');
    timeReverseInput.innerHTML = '';
    let timeOptions;
    if (arrivalTime === null) {
        timeOptions = getTimeOption(index);
    } else {
        timeOptions = data.directions[index].times.map(time => {
            if (new Date(time) < arrivalTime) return;
            return `<option value="${time}">${formatDate(time)} (${data.directions[index].label})</option>`;
        });
    }
    insertOptions(timeReverseInput, timeOptions);
}
const insertDirectionOptions = () => {
    directionInput.innerHTML = '';
    const directionOptions = data.directions.map((direction, index) => {
        if (index === data.selectedDirection) return `<option selected value="${direction.direction}">${direction.label}</option>`;
        return `<option value="${direction.direction}">${direction.label}</option>`;
    });
    insertOptions(directionInput, directionOptions);
}


// Обработчики
const timeInputChangeListener = (e) => {
    const date = new Date(e.target.value);
    insertTimeReverseOptions(1, datesAddition(date).getTime(), false);
}
const directionInputChangeListener = (e) => {
    if (e.target.value === 'aba') {
        onReverseDirectionSelect();
    } else {
        timeInput.removeEventListener('change', timeInputChangeListener);
        timeReverseInput.classList.add('hidden');
        const directionIndex = data.directions.findIndex(direction => direction.direction === e.target.value);
        insertTimeOptions(directionIndex);
    }
}
const formSubmitListener = (e) => {
    e.preventDefault();
    let finalTicketPrice = SINGLE_PRICE,
        finalDirection = TIME_IN_WAY,
        departure = new Date(timeInput.options[timeInput.selectedIndex].value),
        arrival = datesAddition(departure);

    if (directionInput.options[directionInput.selectedIndex].value === 'aba') {
        arrival = datesAddition(timeReverseInput.options[timeReverseInput.selectedIndex].value);
        finalTicketPrice = REVERSE_PRICE;
        finalDirection = (Date.parse(arrival) - Date.parse(departure)) / 60000;
    }
    const finalPrice = ticketsCount.value * finalTicketPrice;
    answerElement.textContent = `
    Вы выбрали ${ticketsCount.value} билета по маршруту 
    ${directionInput.options[directionInput.selectedIndex].textContent} стоимостью ${finalPrice}р.
    Это путешествие займет у вас ${finalDirection} минут. 
    Теплоход отправляется в ${formatDate(departure)}, а прибудет в ${formatDate(arrival)}.
    `;
}


// Функция инициализации(Назначение обработчиков и определение изначального направления)
const init = () => {
    directionInput.addEventListener('change', directionInputChangeListener);
    form.addEventListener('submit', formSubmitListener);
    insertDirectionOptions();
    if (data.directions[data.selectedDirection].direction === 'aba') {
        onReverseDirectionSelect();
    } else {
        insertTimeOptions(directionInput.selectedIndex);
    }
}
init();