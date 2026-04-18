# 🔐 Настройка GitHub Secrets для деплоя

## Необходимые секреты

Для работы GitHub Action нужно добавить 3 секрета в репозиторий:

### 1. SFTP_USERNAME
**Значение:** Ваш SSH/SFTP логин от Hostinger

**Где найти:**
1. Зайти в Hostinger Panel → https://hpanel.hostinger.com
2. Hosting → SSH Access
3. Скопировать Username

**Пример:** `u123456789`

---

### 2. SFTP_SERVER
**Значение:** SSH сервер Hostinger

**Где найти:**
1. Hostinger Panel → SSH Access
2. Скопировать Server/Host

**Пример:** `ssh.hostinger.com` или `srv123.hostinger.com`

---

### 3. SSH_PRIVATE_KEY
**Значение:** Приватный SSH ключ

**Как создать:**

#### Вариант 1: Через Hostinger Panel (рекомендуется)
1. Hostinger Panel → SSH Access
2. Нажать "Generate SSH Key"
3. Скопировать приватный ключ (начинается с `-----BEGIN OPENSSH PRIVATE KEY-----`)

#### Вариант 2: Локально
```bash
# Создать новый SSH ключ
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/hostinger_deploy

# Скопировать приватный ключ
cat ~/.ssh/hostinger_deploy

# Добавить публичный ключ в Hostinger
cat ~/.ssh/hostinger_deploy.pub
# Скопировать и добавить в Hostinger Panel → SSH Access → Add Public Key
```

---

## 📝 Как добавить секреты в GitHub

### Шаг 1: Открыть настройки репозитория
```
https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ/settings/secrets/actions
```

### Шаг 2: Добавить каждый секрет
1. Нажать **"New repository secret"**
2. **Name:** `SFTP_USERNAME`
3. **Secret:** вставить значение
4. Нажать **"Add secret"**

Повторить для `SFTP_SERVER` и `SSH_PRIVATE_KEY`

---

## ✅ Проверка настройки

После добавления всех секретов:

1. Перейти в **Actions** → **Deploy BETA Game**
2. Нажать **"Run workflow"**
3. Выбрать **beta**
4. Нажать **"Run workflow"**

Если всё настроено правильно - деплой начнётся автоматически!

---

## 🔒 Безопасность

- ✅ Секреты зашифрованы GitHub
- ✅ Не видны в логах
- ✅ Доступны только в Actions
- ✅ Можно обновить в любой момент

---

## 🆘 Проблемы

### "Permission denied"
- Проверьте что публичный ключ добавлен в Hostinger
- Проверьте формат приватного ключа (должен начинаться с `-----BEGIN`)

### "Host key verification failed"
- Добавьте в workflow:
  ```yaml
  - name: Add known hosts
    run: ssh-keyscan -H ${{ secrets.SFTP_SERVER }} >> ~/.ssh/known_hosts
  ```

### "Connection refused"
- Проверьте что SSH доступ включён в Hostinger
- Проверьте правильность SFTP_SERVER

---

## 📖 Дополнительно

**Документация Hostinger SSH:**
https://support.hostinger.com/en/articles/1583245-how-to-use-ssh

**GitHub Secrets:**
https://docs.github.com/en/actions/security-guides/encrypted-secrets
