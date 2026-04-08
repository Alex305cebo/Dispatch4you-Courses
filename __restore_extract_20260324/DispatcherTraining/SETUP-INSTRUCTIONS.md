# Git Deploy Setup Instructions

## Step-by-step guide

### Step 1: Connect to Hostinger via SSH

```bash
ssh -p 65002 u123456789@ftp.dispatch4you.com
```

Replace `u123456789` with your Hostinger username.

Where to find: Hostinger hPanel -> Advanced -> SSH Access

---

### Step 2: Create Git folder

```bash
mkdir ~/git-repo
cd ~/git-repo
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
git config pull.rebase false
git config user.email "your@email.com"
git config user.name "Your Name"
```

---

### Step 3: Edit deploy-webhook.php

```bash
nano ~/git-repo/deploy-webhook.php
```

Change 2 lines:

**Line 16 - create a secret password:**
```php
define('WEBHOOK_SECRET', 'my_super_secret_password_12345');
```

**Lines 19-20 - set your username:**
```php
define('GIT_REPO_PATH', '/home/u123456789/git-repo');
define('PUBLIC_HTML_PATH', '/home/u123456789/public_html');
```

Replace `u123456789` with your username!

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Step 4: Copy webhook to public_html

```bash
cp ~/git-repo/deploy-webhook.php ~/public_html/
chmod 644 ~/public_html/deploy-webhook.php
```

---

### Step 5: First sync (manual)

```bash
rsync -av --delete \
  --exclude=".git" \
  --exclude="*.md" \
  --exclude="*.py" \
  --exclude="*.ps1" \
  --exclude="deploy-webhook.php" \
  ~/git-repo/ ~/public_html/
```

Check site: https://dispatch4you.com

---

### Step 6: Setup GitHub Webhook

Go to: `https://github.com/Alex305cebo/dispatch4you-site/settings/hooks`

Click **"Add webhook"**

Fill in:
```
Payload URL: https://dispatch4you.com/deploy-webhook.php
Content type: application/json
Secret: same_password_from_line_16
```

**Events:**
- [x] Just the push event

**Active:**
- [x] Enabled

Click **"Add webhook"**

---

### Step 7: Test!

On your computer:

```bash
./quick-deploy.ps1 -message "Test webhook"
```

**Check:**
1. GitHub -> Settings -> Webhooks -> Recent Deliveries (green checkmark)
2. Site: https://dispatch4you.com
3. Server log: `ssh ... "cat ~/public_html/deploy.log"`

---

## How it works

```
GitHub (push) 
    |
    v
Webhook calls deploy-webhook.php
    |
    v
Git pull in ~/git-repo
    |
    v
Rsync copies files to ~/public_html
    |
    v
Site updated!
```

---

## Safety

- Your site in ~/public_html is NOT touched directly
- Git works in separate folder ~/git-repo
- If something breaks - site keeps working
- Can rollback changes in Git

---

## Troubleshooting

**SSH connection fails:**
- Try port 22 instead of 65002
- Check username/password in Hostinger

**Git clone fails:**
- Check repository URL
- Make sure git is installed: `git --version`

**Webhook returns 403:**
- Check that Secret in GitHub matches WEBHOOK_SECRET in PHP

**Files not syncing:**
- Check paths in deploy-webhook.php
- Run rsync command manually to see errors

---

## Done!

Now every push automatically updates your site via Git!

**Deploy time:** 1-5 seconds
**Site:** https://dispatch4you.com
