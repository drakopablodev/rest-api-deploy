const http = require('node:http') // require('node:http') <- node v.^16.Y.Z
const fs = require('node:fs')
const { findAvaliablePort } = require('./free-port.js')
const { DEFAULT_PORT } = require('./constants.js')

module.exports = { createMyServer }

function createMyServer (routing) {
  // Function for processing a request
  /* 
    const processRequest = (req, res) => {
    console.log('request received from: ', req.url)
    res.end('<h1>Hola Mundo</h1>')
  }*/

  /**
   * HTTP Status code:
   *  > 100 - 199: Informative response
   *  > 200 - 299: Satisfactory response
   *  > 300 - 399: Redirections
   *  > 400 - 499: Client side errors
   *  > 500 - 599: Server side errors
   */

  /**
   * Function for processing requests in the server side
   * @param {Request} req 
   * @param {Response} res 
   */
  const processRequest2 = (req, res) => {
    // Mapping through differents URLs
    res.setHeader('Content-Type', 'text/html; charset=utf-8') // Common
    if (req.url === '/') {
      // res.statusCode = 200 // OK - By default
      res.end('Bienvenido a mi página web')
    } else if (req.url === '/contacto') {
      // res.statusCode = 200
      res.end('Contacto')
    } else if (req.url === '/perrete.webp') {
      // (!) Read and serve a file
      fs.readFile('./files/slav-cheems.webp', (err, data) => {
        if (err) {
          res.statusCode = 500
          res.end('500 - Internal Server Error')
        } else {
          res.setHeader('Content-Type', 'image/webp') // Image with extension
          res.end(data)
        }
      })
    } else {
      res.statusCode = 404
      res.end('404 - Página no encontrada')
    }
  }

  const server = http.createServer(routing ?? processRequest2)

  findAvaliablePort(DEFAULT_PORT).then(port => {
    // THe server listen in the desired
    server.listen(port, () => {
      console.log(`server listening on port http://localhost:${server.address().port}`)
    })
  })
}
