const net = require('net') // node:net

module.exports = { findAvaliablePort }

function findAvaliablePort (desiredPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    // We try to listen to the desired port
    // In case it is avaliable, we resolve the promise
    server.listen(desiredPort, () => {
      const { port } = server.address()
      server.close(() => {
        resolve(port)
      })
    })
    // In case an error has been produced,
    // we resolve with another available port or reject
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port 0 <-- search for the first opened port
        // (!) or: desiredPort + 1
        findAvaliablePort(0).then(port => resolve(port))
      } else {
        reject(err) // We reject if it's an unknown error
      }
    })
  })
}
