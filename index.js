const { createMyServer } = require('./functionality/create-server.js')
const { processRequest } = require('./functionality/routing.js')

console.log('hola mundo')
createMyServer(processRequest)
