const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = "your_secret_key";

// Função para ler usuários do db.json
const getUsers = () => {
  const dbPath = path.resolve(__dirname, 'db.json');
  const dbContent = fs.readFileSync(dbPath);
  const db = JSON.parse(dbContent);
  return db.users;
};

// Middleware do json-server
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use('/api', router);

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(404).send({ message: 'User not found or invalid password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: 86400 // expires in 24 hours
  });

  const { password: _, ...userWithoutPassword } = user; // Remove a senha da resposta
  res.status(200).send({ user: userWithoutPassword, token });
});

// Rota protegida (exemplo)
app.get('/protected', (req, res) => {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to authenticate token' });
    }

    res.status(200).send(decoded);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
