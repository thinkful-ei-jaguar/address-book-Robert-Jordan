require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, Token } = require('./config')
const app = express();
const uuid = require('uuid/v4');
app.use(express.json());

const morganOption = NODE_ENV === 'production'
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  console.log(authToken, Token, authToken.split(' ')[1]);
  if (!authToken || authToken.split(' ')[1] !== Token) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // console.log('Object entries', Object.entries(req));
  return next()
}

app.use(function errorHandler(error, req, res, next) {
   let response
   if (NODE_ENV === 'production') {
     response = { error: { message: 'server error' } }
   } else {
     console.error(error)
     response = { message: error.message, error }
   }
   res.status(500).json(response)
 })

address=[
  {
    id: 1,
    firstName: "String",
    lastName: "String",
    address1: "String",
    address2: "String",
    city: "String",
    state: "String",
    zip: 78945
  },
  {
    id: 2,
    firstName: "String2",
    lastName: "String2",
    address1: "String2",
    address2: "String2",
    city: "String2",
    state: "String2",
    zip: 99854
  },{
    id: 3,
    firstName: "String2",
    lastName: "String2",
    address1: "String2",
    address2: "String2",
    city: "String2",
    state: "String2",
    zip: 12345
  },
]

app.get('/address', (req, res) => {
  res.json(address);
})

function handlePostAddress (req, res) {
  const id = uuid();
  console.log(req.body);
  const { firstName, lastName, address1 , address2='', city, state, zip } = req.body;

  if(!firstName){
    return res.status(400).send("First name required")
  }
  if(!lastName){
    return res.status(400).send("Last name required")
  }
  if(!address1){
    return res.status(400).send("Address required")
  }
  if(!city){
    return res.status(400).send("City required")
  }
  if(!state){
    return res.status(400).send("State required")
  }
  if(state.length !== 2){
    return res.status(400).send("State needs to be 2 Characters")
  }
  if(!zip){
    return res.status(400).send("zip required")
  }
  if(zip < 10000 && zip > 99999){
    return res.status(400).send("zip need to be 5 digits")
  }
  const newObj={
    ...req.body,
    id
  }

  address.push(newObj);

  res
  .status(201)
  .location(`http://localhost:8081/address/${id}`)
  .json(newObj)
  .end();

};

app.post('/address', validateBearerToken, handlePostAddress);

app.delete('/address/:addressId', validateBearerToken, (req, res) => {
  const { addressId } = req.params;
  console.log(addressId);

  const index = address.findIndex(u => u.id === addressId);

  if(index === -1){
    return res.status(404).send('User not found');
  }

  address.splice(index, 1)

  res.status(204).end();
});

module.exports = app