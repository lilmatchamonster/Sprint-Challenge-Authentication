const axios = require('axios');
const bcrypt = require('bcryptjs');

const { authenticate } = require('../auth/authenticate');
const myTokens = require('../auth/myTokens')
const Users = require('./users-module');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(registered => {
      res.status(201).json(registered);
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

function login(req, res) {
  // implement user login
  const { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then( user => {
      if(user && bcrypt.compareSync(password, user.password)) {
        const token = myTokens.generateToken(user);

        res.status(200).json({ message: `Welcome ${user.username} to My Daily Dad Joke`, your_token: token });
      }
      else {
        res.status(401).json({ message: 'Invalid Credentials, Please Try Again.' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
};
