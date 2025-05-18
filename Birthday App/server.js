const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_PATH = './data.json';

// 初始化文件
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify([]));

app.post('/submit', (req, res) => {
  const { name, birthday } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const existing = data.find(entry => entry.name === name);
  if (existing) {
    existing.birthday = birthday;
  } else {
    data.push({ name, birthday });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.sendStatus(200);
});

app.get('/check', (req, res) => {
  const name = req.query.name;
  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const user = data.find(entry => entry.name === name);
  if (!user) {
    return res.json({ message: "User not found." });
  }

  const today = new Date();
  const bday = new Date(user.birthday);
  bday.setFullYear(today.getFullYear());

  const diff = Math.ceil((bday - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) {
    res.json({ message: `🎉 Happy Birthday, ${user.name}! 🎉` });
  } else if (diff > 0) {
    res.json({ message: `🎂 ${user.name}'s birthday is in ${diff} day(s).` });
  } else {
    // Birthday passed this year
    const nextBday = new Date(user.birthday);
    nextBday.setFullYear(today.getFullYear() + 1);
    const daysLeft = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
    res.json({ message: `🎂 ${user.name}'s birthday is in ${daysLeft} day(s).` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
