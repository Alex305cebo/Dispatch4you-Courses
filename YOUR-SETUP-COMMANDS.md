# Your Setup Commands

## Step 1: Connect to Hostinger

```bash
ssh -p 65002 u724602277@147.93.42.76
```

Enter your SSH password when prompted.

---

## Step 2: Create Git folder and clone

```bash
mkdir ~/git-repo
cd ~/git-repo
git clone https://github.com/Alex305cebo/dispatch4you-site.git .
git config pull.rebase false
git config user.email "alex@dispatch4you.com"
git config user.name "Alex"
```

---

## Step 3: Edit webhook file

```bash
nano ~/git-repo/deploy-webhook.php
```

Change these lines:

**Line 16:**
```php
define('WEBHOOK_SECRET', 'my_secret_password_123');
```
(Create your own strong password!)

**Lines 19-20:**
```php
define('GIT_REPO_PATH', '/home/u724602277/git-repo');
define('PUBLIC_HTML_PATH', '/home/u724602277/public_html');
```

Save: Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

---

## Step 4: Copy webhook to public_html

```bash
cp ~/git-repo/deploy-webhook.php ~/public_html/
chmod 644 ~/public_html/deploy-webhook.php
```

---

## Step 5: First manual sync

```bash
rsync -av --delete \
  --exclude=".git" \
  --exclude="*.md" \
  --exclude="*.py" \
  --exclude="*.ps1" \
  --exclude="*.bat" \
  --exclude="deploy-webhook.php" \
  ~/git-repo/ ~/public_html/
```

---

## Step 6: Setup GitHub Webhook

Go to: https://github.com/Alex305cebo/dispatch4you-site/settings/hooks

Click "Add webhook"

```
Payload URL: https://dispatch4you.com/deploy-webhook.php
Content type: application/json
Secret: (same password from Step 3, line 16)
Events: Just the push event
Active: Yes
```

---

## Step 7: Test!

On your computer:
```bash
./quick-deploy.ps1 -message "Test webhook"
```

Check:
- GitHub -> Settings -> Webhooks -> Recent Deliveries
- https://dispatch4you.com

---

## Check logs on server

```bash
ssh -p 65002 u724602277@147.93.42.76
cat ~/public_html/deploy.log
```

---

## Done!

Every push now automatically updates your site!
