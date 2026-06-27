import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { checkAdobeAccount } from '../lib/dongvanfb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not set in .env.local');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const dbPath = path.resolve(__dirname, '..', 'emails.db');
const db = new Database(dbPath);

console.log('[Bot] Started fetching updates...');

const supportModes = new Set(); // Stores chat_id of users in support mode

const KEYBOARD_MENU = {
    reply_markup: {
        keyboard: [
            [{ text: '👤 Мой аккаунт' }, { text: '📩 Письма' }],
            [{ text: '💬 Поддержка' }]
        ],
        resize_keyboard: true
    }
};

bot.onText(/\/start (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const linkToken = match[1];

    try {
        const client = db.prepare('SELECT id FROM clients WHERE bot_link_token = ?').get(linkToken);
        if (client) {
            db.prepare('UPDATE clients SET telegram_chat_id = ? WHERE id = ?').run(chatId.toString(), client.id);
            bot.sendMessage(chatId, '✅ Ваш аккаунт успешно привязан! Выберите действие в меню ниже.', KEYBOARD_MENU);
        } else {
            bot.sendMessage(chatId, '❌ Неверный или устаревший код привязки.');
        }
    } catch (e) {
        console.error(e);
        bot.sendMessage(chatId, '⚠️ Произошла ошибка. Попробуйте позже.');
    }
});

bot.onText(/\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Для работы со мной нужно перейти по уникальной ссылке-приглашению.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (text && text.startsWith('/')) return;

    // Get client
    const client = db.prepare('SELECT * FROM clients WHERE telegram_chat_id = ?').get(chatId.toString());
    if (!client) {
        if (!text.startsWith('/')) {
            bot.sendMessage(chatId, 'Вы не привязаны ни к какому аккаунту.');
        }
        return;
    }

    if (text === '👤 Мой аккаунт') {
        supportModes.delete(chatId);
        if (!client.adobe_account_id) {
            return bot.sendMessage(chatId, '❌ К вашему профилю не привязан ни один Adobe аккаунт. Напишите в поддержку.');
        }
        const acc = db.prepare('SELECT * FROM adobe_accounts WHERE id = ?').get(client.adobe_account_id);
        if (!acc) {
            return bot.sendMessage(chatId, '❌ Аккаунт не найден. Обратитесь в поддержку.');
        }

        const msgText = `👤 **Данные аккаунта:**
        
📧 Email: ${acc.email}
🔑 Пароль: ${acc.password || 'Нет'}
🔐 Пароль Adobe: ${acc.adobe_password || 'Нет'}
📊 Статус: ${acc.status === 'active' ? '🟢 Активен' : '🔴 Заблокирован'}`;
        return bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    }

    if (text === '📩 Письма') {
        supportModes.delete(chatId);
        if (!client.adobe_account_id) {
            return bot.sendMessage(chatId, '❌ К вашему профилю не привязан ни один Adobe аккаунт.');
        }
        const acc = db.prepare('SELECT * FROM adobe_accounts WHERE id = ?').get(client.adobe_account_id);
        if (!acc) {
            return bot.sendMessage(chatId, '❌ Аккаунт не найден.');
        }

        bot.sendMessage(chatId, '⏳ Проверяем последние письма...');
        try {
            const result = await checkAdobeAccount(acc.email, acc.refresh_token, acc.device_id);
            let codes = [];
            if (result && result.messages && Array.isArray(result.messages)) {
                codes = result.messages.filter(m => {
                    const subj = (m.subject || '').toLowerCase();
                    return subj.includes('verification code') || subj.includes('email address changed') || subj.includes('suspended');
                }).slice(0, 5);
            }
            
            if (codes.length === 0) {
                return bot.sendMessage(chatId, 'Писем с кодами не найдено.');
            }

            let responseText = '📩 **Последние важные письма:**\n\n';
            for (const m of codes) {
                const codeMatch = m.subject?.match(/\b\d{6}\b/);
                const code = codeMatch ? codeMatch[0] : (m.code || 'Код не найден (возможно просто уведомление)');
                responseText += `От: ${m.from?.address || m.from || 'Adobe'}\nТема: ${m.subject}\nКод: **${code}**\nВремя: ${m.date}\n---\n`;
            }
            return bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' });
        } catch (e) {
            return bot.sendMessage(chatId, '⚠️ Не удалось получить письма. Попробуйте позже.');
        }
    }

    if (text === '💬 Поддержка') {
        supportModes.add(chatId);
        return bot.sendMessage(chatId, '💬 Вы в режиме общения с поддержкой. Напишите ваш вопрос ниже:', {
            reply_markup: {
                keyboard: [[{ text: '❌ Выйти из поддержки' }]],
                resize_keyboard: true
            }
        });
    }

    if (text === '❌ Выйти из поддержки') {
        supportModes.delete(chatId);
        return bot.sendMessage(chatId, 'Вы вышли из режима поддержки.', KEYBOARD_MENU);
    }

    // Normal message handling (Support)
    if (supportModes.has(chatId) && text) {
        try {
            db.prepare('INSERT INTO support_messages (client_id, sender, message) VALUES (?, ?, ?)')
              .run(client.id, 'client', text);
            bot.sendMessage(chatId, '✅ Сообщение доставлено.');
        } catch (e) {
            console.error(e);
            bot.sendMessage(chatId, '⚠️ Не удалось отправить сообщение.');
        }
    } else {
        bot.sendMessage(chatId, 'Пожалуйста, используйте меню.', KEYBOARD_MENU);
    }
});
