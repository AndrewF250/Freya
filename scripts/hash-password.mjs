/**
 * Генерирует scrypt-хеш пароля для входа в кабинет мастера.
 *
 *   npm run hash-password -- мойпароль
 *
 * Результат вставьте в .env как ADMIN_PASSWORD_HASH и удалите ADMIN_PASSWORD.
 */
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];

if (!password) {
  console.error("Укажите пароль: npm run hash-password -- мойпароль");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Пароль должен быть не короче 8 символов.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);

console.log("\nВставьте эту строку в .env:\n");
console.log(`ADMIN_PASSWORD_HASH="${salt.toString("hex")}:${hash.toString("hex")}"`);
console.log("\nИ удалите оттуда ADMIN_PASSWORD.\n");
