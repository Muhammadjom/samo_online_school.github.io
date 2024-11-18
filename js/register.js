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
    const adress = formData.get('adress');
    const commentari = formData.get('commentari')

    // Создание сообщения
    const message = `ФИО: ${fullName}\nНомер телефона: ${phoneNumber}\nАдрес доставки: ${adress}\nКомментарий: ${commentari}`;

 
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
      .then(data => console.log('Message sent: ', data))
      .catch(error => console.error('Error sending message: ', error));

    // Если нужно отправить файл, используем другой запрос
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



