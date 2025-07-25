const ADMIN_ID = 5291401463; // Заменить на свой Telegram ID
require('dotenv').config();

const token = process.env.TELEGRAM_TOKEN;
const TelegramBot = require('node-telegram-bot-api');

// Создаём бота в режиме polling
const bot = new TelegramBot(token, { polling: true });

console.log('Бот запущен!');

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Напиши /help, чтобы узнать мои команды.');
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `
Вот, что я умею:
/start - начать диалог
/help - показать помощь
/buttons - показать кнопки
/s - название трека/видео на ютуб для поиска
  `;
  bot.sendMessage(chatId, helpText);
});

// Команда /buttons — покажем кнопки
bot.onText(/\/buttons/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Кнопка 1', callback_data: 'btn1' },
          { text: 'Кнопка 2', callback_data: 'btn2' }
        ]
      ]
    }
  };
  bot.sendMessage(chatId, 'Выбери кнопку:', options);
});

// Обработка нажатий на кнопки
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;

  if (data === 'btn1') {
    bot.sendMessage(chatId, 'Ты нажал кнопку 1!');
  } else if (data === 'btn2') {
    bot.sendMessage(chatId, 'Ты нажал кнопку 2!');
  }
});

// Поиск аудио
const ytSearch = require('yt-search');

bot.onText(/\/s (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1]; // текст после /s

  bot.sendMessage(chatId, `Ищу трек <3: ${query}...`);

  try {
    const r = await ytSearch(query);
    const videos = r.videos;
    if (videos.length > 0) {
      const video = videos[0];
      const url = video.url;
      
      // Отправляем ссылку на первое найденное видео
      bot.sendMessage(chatId, `Нашёл:\n${video.title}\n${url}`);
    } else {
      bot.sendMessage(chatId, 'Ничего не найдено 😕');
    }
  } catch (error) {
    bot.sendMessage(chatId, 'Произошла ошибка при поиске 😞');
    console.error(error);
  }
});




const fs = require('fs');
const path = require('path');
const usersFile = path.resolve(__dirname, 'users.json');

// Функция для добавления пользователя в лог
function logUser(user) {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения users.json:', err);
      return;
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch (e) {
      console.error('Ошибка парсинга users.json:', e);
      return;
    }

    // Проверяем, есть ли уже пользователь
    const exists = users.some(u => u.id === user.id);
    if (!exists) {
      users.push(user);
      fs.writeFile(usersFile, JSON.stringify(users, null, 2), (err) => {
        if (err) console.error('Ошибка записи users.json:', err);
        else console.log(`Добавлен пользователь ${user.id}`);
      });
    }
  });
}

// В обработчик сообщений добавляем логирование
bot.on('message', (msg) => {
  const user = {
    id: msg.from.id,
    first_name: msg.from.first_name || '',
    last_name: msg.from.last_name || '',
    username: msg.from.username || '',
    date: new Date().toISOString()
  };

  logUser(user);

  // Остальной код обработки сообщений
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (!text.startsWith('/')) {
    bot.sendMessage(chatId, `Ты написал: ${text}`);
  }
});


bot.onText(/\/users/, (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== ADMIN_ID) {
    return bot.sendMessage(chatId, 'У тебя нет доступа к этому списку.');
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения users.json:', err);
      bot.sendMessage(chatId, 'Не удалось прочитать список пользователей.');
      return;
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch (e) {
      console.error('Ошибка парсинга users.json:', e);
      bot.sendMessage(chatId, 'Ошибка обработки данных пользователей.');
      return;
    }

    if (users.length === 0) {
      bot.sendMessage(chatId, 'Пока нет пользователей.');
      return;
    }

    let response = 'Список пользователей:\n\n';
    users.forEach((user, index) => {
      response += `${index + 1}. ${user.first_name || ''} ${user.last_name || ''} (@${user.username || '-'}) — ID: ${user.id}\n`;
    });

    if (response.length > 4000) {
      bot.sendMessage(chatId, 'Слишком много пользователей, список слишком длинный.');
    } else {
      bot.sendMessage(chatId, response);
    }
  });
});

  // Далее код для чтения users.json и отправки списка...
  // (тот, что я писал раньше)


