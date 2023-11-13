const http = require('node:http')

// commonJS --> Módulos clasicos de node 
const dittoJSON = require('../pokemon/ditto.json') // Se puede leer un JSON directamente

const processRequest = (req, res) => {
  const { method, url } = req
  // Switch of method types
  switch (method) {
    case 'GET':
      // Switch of urls that use 'GET' method
      switch (url) {
        case '/pokemon/ditto':
          res.setHeader('Content-Type', 'text/html; chartset=utf-8')
          return res.end(JSON.stringify(dittoJSON))
        default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; chartset=utf-8')
          return res.end('<h1>404 - pokemon not found</h1>')
      }
    case 'POST':
      // Switch of urls that use 'POST' method
      switch (url) {
        case '/pokemon':
          // (!) Si no ponemos la constante entre llaves { body } se comparte la variable en el bloque de funcion actual
          let body = ''
          // Listening to the "data" event ("chunk" is a read buffer)
          req.on('data', chunk => {
            body += chunk.toString()
          })
          // End of "data" chunk transfer
          req.on('end', chunk => {
            const data = JSON.parse(body) // JSON.parse() because we receive a JSON object
            // Llamar a una base de datos para guardar la info
            res.writeHead(201, { 'Content-Type': 'application/json; chartset=utf-8' })
            data.timestamp = Date.now()
            // Enviamos los datos
            res.end(JSON.stringify(data))
          })
          // End of case
          break
        default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; chartset=utf-8')
          return res.end('<h1>404 - pokemon not found</h1>')
      }
  }
}


module.exports = { processRequest }