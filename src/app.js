const express = require('express');

const app = express();
app.use(express.json());

app.get('/breeds/image/random', (req, res) => {
  res.status(200).json({
    message: 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg',
    status: 'success',
  });
});

let nextId = 80001;
const users = [
  {
    id: 79999,
    name: 'Олександр Коваленко',
    email: 'oleksandr.kovalenko@example.com',
    gender: 'male',
    status: 'active',
  },
  {
    id: 80000,
    name: 'Марія Шевченко',
    email: 'maria.shevchenko@example.com',
    gender: 'female',
    status: 'inactive',
  },
];

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1].trim() === '') {
    return res.status(401).json({ message: 'Authentication failed' });
  }
  next();
}

app.get('/public/v2/users', (req, res) => {
  let result = [...users];
  if (req.query.gender) {
    result = result.filter((u) => u.gender === req.query.gender);
  }
  if (req.query.status) {
    result = result.filter((u) => u.status === req.query.status);
  }
  if (req.query.per_page) {
    result = result.slice(0, Number(req.query.per_page));
  }
  res.status(200).json(result);
});

app.get('/public/v2/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'Resource not found' });
  }
  res.status(200).json(user);
});

app.post('/public/v2/users', requireAuth, (req, res) => {
  const { name, email, gender, status } = req.body;
  const errors = [];

  if (!name) errors.push({ field: 'name', message: "can't be blank" });
  if (!email) errors.push({ field: 'email', message: "can't be blank" });
  if (!gender || !['male', 'female'].includes(gender)) {
    errors.push({ field: 'gender', message: "can't be blank, can be male of female" });
  }
  if (!status || !['active', 'inactive'].includes(status)) {
    errors.push({ field: 'status', message: "can't be blank, can be active or inactive" });
  }
  if (email && users.some((u) => u.email === email)) {
    errors.push({ field: 'email', message: 'has already been taken' });
  }

  if (errors.length > 0) {
    return res.status(422).json(errors);
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    gender,
    status,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/public/v2/users/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  const { name, email, gender, status } = req.body;
  users[userIndex] = {
    id,
    name: name ?? users[userIndex].name,
    email: email ?? users[userIndex].email,
    gender: gender ?? users[userIndex].gender,
    status: status ?? users[userIndex].status,
  };

  res.status(200).json(users[userIndex]);
});

app.patch('/public/v2/users/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
    id,
  };

  res.status(200).json(users[userIndex]);
});

app.delete('/public/v2/users/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
});

module.exports = app;
