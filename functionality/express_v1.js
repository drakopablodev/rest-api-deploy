// Express app
const express = require('express')
const app = express()
app.disable('x-powered-by') // Desabilitamos esta cabecera
// Other imports
const { DEFAULT_PORT } = require('./constants.js')
const dittoJSON = require('../pokemon/ditto.json') // Se puede leer un JSON directamente

app.use('/', (req, res, next) => {
  console.log('mi primer middleware')
  // TODO: trackear la request a la base de datos
  // TODO: revisar si el usuario tiene cookies
  // (!) Cuando terminemos de procesar la peticion, tenemos que indicar al request que avance
  // al siguiente punto del middelware o, en caso de que no haya más middleware, a la ruta URL
  // mapeada en la API. En caso de no haber URL a la que continuar, cae en el 404.
  next()
})

/*app.get('/', (req, res) => {
  // Default status: 200
  res.status(200).send('<h1>Hola mundo</h1>')
})*/

app.get('/pokemon/ditto', (req, res) => {
  res.json(dittoJSON)
})

app.post('/pokemon', (req, res) => {
  // (!) Si no ponemos la constante entre llaves { body } se comparte la variable en el bloque de funcion actual
  let body = ''
  // Listening to the "data" event ("chunk" is a read buffer)
  req.on('data', chunk => {
    body += chunk.toString()
  })
  // End of "data" chunk transfer
  req.on('end', chunk => {
    const data = JSON.parse(body) // JSON.parse() because we receive a JSON object
    // TODO: Llamar a una base de datos para guardar la info
    // La siguiente línea ya no hace falta porque express lo detecta automáticamente por debajo
    // res.writeHead(201, { 'Content-Type': 'application/json; chartset=utf-8' })
    data.timestamp = Date.now()
    // Enviamos los datos
    res.status(201).json(data)
  })
})

/**
 * Para resolver las URLs que no se encuentran, se debe hacer en orden. Es decir,
 * las URLs que si existan, se escribirán arriba de este comentario. Sin embargo,
 * para las que no pueda encontrar, usamos la funcion use() para indicar que,
 * en otro caso, debe caer en esta ruta por defecto. En nuestro caso, el error 404.
 * Si no especificamos ruta URL, las coge todas por defecto.
 */
// La ultima a la que va a llegar
app.use((req, res) => {
  res.status(404).send('<h1>404 - Not found</h1>')
})

const server = app.listen(DEFAULT_PORT, () => {
  // QUE: I quite not understand how con I use a variable value declaration inside its value
  // ANS: The second parameter is a callback funcion. Thus, the variable would be created and evaluated
  //      in the listen() function, so we can use it safely in the second parameter as the callback.
  // https://www.kevinsimper.dk/posts/how-to-get-the-port-of-express.js-app-devtip
  console.log(`server listening on port http://localhost:${server.address().port}`)
})
