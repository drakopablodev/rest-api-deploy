// Express app
const express = require('express') // require -> commonJS
const app = express()
app.disable('x-powered-by') // (!) Deshabilitamos esta cabecera por seguridad
// Other imports
const crypto = require('node:crypto') // Librería nativa para generación de criptografía
// const zod = require('zod') // Esta librería se utiliza para validar tipos de datos en runtime
const { DEFAULT_PORT } = require('./constants.js')
const { validateMovie, validateMoviePartial } = require('../schemas/movies.schema.js')
const dittoJSON = require('../pokemon/ditto.json') // Se puede leer un JSON directamente
const moviesJSON = require('../files/movies.json')

/*// CORS
const cors = require('cors') // Libreria que soluciona el problema de CORS
// app.use(cors()) // Si no indicamos nada soluciona CORS poniendo "*" a todo
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:3000' // (!) Esta no haría falta porque si tiene el mismo origen, no aparece en la cabecera
    ]
    // Si es un origen aceptado, ejecutamos el callback
    if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true) // ???
    }
  }
}))
*/

// Express hace el preprocesamiento del body para que este esté disponible 
// y accesible desde la request "req"
app.use(express.json())

// Las siguientes lineas de middleware se pueden reducir en la linea anterior
/*
app.use('/', (req, res, next) => {
  if (req.method !== 'POST') return next()
  if (req.headers['content-type'] !== 'application/json') return next()

  // Solo llegan request que son 'POST' y que tienen el header 'Content-Type: application/json'
  let body = ''
  // Listening to the "data" event ("chunk" is a read buffer)
  req.on('data', chunk => {
    body += chunk.toString()
  })
  // End of "data" chunk transfer
  req.on('end', () => {
    const data = JSON.parse(body)
    data.timestamp = Date.now()
    // NO enviamos los datos
    // res.status(201).json(data)
    // Mutamos la request y metemos la información en el req.body
    req.body = data
    next()
  })
})
*/
// POKEMON
app.get('/pokemon/ditto', (req, res) => {
  res.json(dittoJSON)
})

app.post('/pokemon', (req, res) => {
  // (!) Los datos ya han sido en el middleware anterior y estan en el req.body
  res.status(201).json(req.body) // Enviamos los datos
})

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000' // (!) Esta no haría falta porque si tiene el mismo origen, no aparece en la cabecera
]

// PELICULAS
app.get('/movies', (req, res) => {
  // Para solucionar el problema de CORS, debemos añadir en nuestro endpoint la cabecera
  // res.header('Access-Control-Allow-Origin', '*') // *: permite todos los origenes
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080') // Permite solo 1
  const origin = req.header('origin')
  if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
    // Si el request es de la misma pagina, no tiene origen
    res.header('Access-Control-Allow-Origin', origin)
  }

  // Modificamos este endpoint para filtrar usando los query params de la URL
  const { genre, year } = req.query
  let filteredMovies = moviesJSON
  if (genre) {
    // El ejemplo de abajo sería si queremos filtrar "exactamente" el valor del query param
    // const filteredMovies = moviesJSON.filter(movie => movie.genre.includes(genre))
    // El ejemplo de abajo es para filtrar una palabra que no es case-sensitive
    filteredMovies = filteredMovies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
  }
  if (year) {
    // El ejemplo de abajo sería si queremos filtrar "exactamente" el valor del query param
    // const filteredMovies = moviesJSON.filter(movie => movie.genre.includes(genre))
    // El ejemplo de abajo es para filtrar una palabra que no es case-sensitive
    filteredMovies = filteredMovies.filter(movie => movie.year === year)
  }
  res.json(filteredMovies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = moviesJSON.find(movie => movie.id === id)
  // Si encontramos la pelicula
  if (movie) return res.json(movie)
  // Si no
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  // Leemos los parámetros del cuerpo del request (req.body)
  /*const {
    title,
    genre,
    year,
    director,
    duration,
    rate,
    poster
  } = req.body
  
  // Creamos una nueva película
  const newMovie = {
    id: crypto.randomUUID(),
    title,
    genre,
    year,
    director,
    duration,
    rate: rate ?? 0,
    poster
  }
  */

  // Con el nuevo metodo del schema no tenemos que crear un objeto por cada query param del body
  const result = validateMovie(req.body)

  // Comprobamos si ha habido algun error de validación
  if (result.error) {
    // 422 - Unprocessable Entity
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }

  // Además, ya que hemos validado los datos en el schema, podemos pasar el resultado directamente
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // (!) Esto no sería REST, porque estamos guardando el estado de la aplicación en memoria
  moviesJSON.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validateMoviePartial(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }

  const { id } = req.params
  const movieIndex = moviesJSON.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updatedMovie = {
    ...moviesJSON[movieIndex],
    ...result.data
  }

  moviesJSON[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})

/**
 * NOTAS:
 * 1. Métodos normales: GET, HEAD, POST
 * 2. Métodos complejos: PUT, PATCH, DELETE
 *
 * (!) CORS PRE-Flight: necesita el verbo OPTIONS para evitar el CORS al hacer el DELETE
 * Es decir, necesita esta petición antes para comprobar si está permitido o no hacer la siguiente operación
 */

app.options('/movies/:id', (req, res) => {
  // Para solucionar el problema de CORS, debemos añadir en nuestro endpoint la cabecera
  // res.header('Access-Control-Allow-Origin', '*') // *: permite todos los origenes
  // res.header('Access-Control-Allow-Origin', 'http://localhost:8080') // Permite solo 1
  const origin = req.header('origin')
  if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
    // Si el request es de la misma pagina, no tiene origen
    res.header('Access-Control-Allow-Origin', origin)
    // (!) Es necesario indicar los métodos que sí puede utilizar
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  }
  res.sendStatus(200)
})

// (!) Da error de CORS si no se define el endpoint de "OPTIONS"
app.delete('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
    // Si el request es de la misma pagina, no tiene origen
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params
  const movieIndex = moviesJSON.find(movie => movie.id === id)
  // Si no encontramos la pelicula
  if (movieIndex === -1) {
    res.status(404).json({ message: 'Movie not found' })
  }

  moviesJSON.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
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
