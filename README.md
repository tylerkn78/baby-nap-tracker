# 🐳 Baby Nap Tracker

A baby nap tracking web app built with Node.js and Express. Nap records are stored in a local `naps.json` file on the server.

**Default address:** `http://192.168.68.XX:3001`

---

## Project structure

```
baby-nap-tracker/
├── index.html      # Frontend app
├── server.js       # Express backend + REST API
├── package.json    # Node.js dependencies
├── .gitignore      # Excludes node_modules and naps.json
└── naps.json       # Auto-created on first save (not in git)
```

---

## Deploying to Ubuntu from GitHub

### 1. Install Node.js on the server (if not already installed)

SSH into your server, then run:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Confirm it worked:

```bash
node -v
npm -v
```

### 2. Clone the repo from GitHub

```bash
cd /home/youruser
git clone https://github.com/YOUR_USERNAME/baby-nap-tracker.git
cd baby-nap-tracker
```

### 3. Install dependencies

```bash
npm install
```

### 4. Test it manually first

```bash
node server.js
```

You should see:
```
Baby nap tracker running at http://localhost:3001
```

Open a browser and go to `http://192.168.68.XX:3001` (replace XX with your server's actual IP).
Press `Ctrl+C` to stop it once confirmed working.

---

## Run as a persistent background service (systemd)

This keeps the app running after you close your SSH session, and automatically restarts it if it crashes or the server reboots.

### 1. Create the service file

```bash
sudo nano /etc/systemd/system/nap-tracker.service
```

Paste the following — update `User` and `WorkingDirectory` to match your setup:

```ini
[Unit]
Description=Baby Nap Tracker
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/baby-nap-tracker
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### 2. Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable nap-tracker
sudo systemctl start nap-tracker
```

### 3. Confirm it's running

```bash
sudo systemctl status nap-tracker
```

You should see `Active: active (running)`.

---

## Updating the app after a GitHub push

SSH into the server and run:

```bash
cd /home/youruser/baby-nap-tracker
git pull
sudo systemctl restart nap-tracker
```

That's it — your nap data in `naps.json` is unaffected by updates since it's excluded from git.

---

## Useful commands

| Task | Command |
|---|---|
| Start the service | `sudo systemctl start nap-tracker` |
| Stop the service | `sudo systemctl stop nap-tracker` |
| Restart the service | `sudo systemctl restart nap-tracker` |
| View live logs | `sudo journalctl -u nap-tracker -f` |
| Check status | `sudo systemctl status nap-tracker` |

---

## Data backup

All nap records live in `naps.json` in the project folder. To back it up:

```bash
cp /home/youruser/baby-nap-tracker/naps.json ~/naps-backup.json
```

---

## Firewall (if the port is blocked)

If you can't reach the app from another device on the network, open the port:

```bash
sudo ufw allow 3001/tcp
sudo ufw reload
```
