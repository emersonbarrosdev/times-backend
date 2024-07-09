const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jsonServer = require('json-server');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = "your_secret_key";

const db = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
app.use(middlewares);
app.use('/api', db);

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.db.get('users').find({ username }).value();

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(404).send({ message: 'User not found or invalid password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: 86400 // expires in 24 hours
  });

  const { password: _, ...userWithoutPassword } = user; // Remove a senha da resposta
  res.status(200).send({ user: userWithoutPassword, token });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
