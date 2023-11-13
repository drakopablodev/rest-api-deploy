const zod = require('zod') // Esta librería se utiliza para validar tipos de datos en runtime
/**
 * NOTAS:
 * 1. Todos los parámetros que no se validen, se ignoran por defecto. Esto tiene un efecto
 * de seguridad para evitar injecciones SQL y, además, en este caso, no se puede modificar
 * el id del objeto ya que no está establecido en el validador.
 */


// Creamos un esquema de tipos de datos con zod
const movieSchema = zod.object({
  title: zod.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  genre: zod.array(
    zod.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci—Fi']),
    {
      invalid_type_error: 'Movie genre must be a valid genre',
      required_error: 'Movie genre is required'
    }
  ),
  year: zod.number().int().positive().min(1900).max(Date.now().year),
  director: zod.string({
    invalid_type_error: 'Movie director must be a string',
    required_error: 'Movie director is required'
  }),
  duration: zod.number().int().positive(),
  rate: zod.number().positive().max(10).default(5),
  poster: zod.string().url({
    invalid_type_error: 'Movie poster must be a valid URL'
  }) // .endsWith('.jpg')
})

// Validamos la pelicula
function validateMovie (object) {
  return movieSchema.safeParse(object) // Con la opción "safeParseAsync" evitamos el bloqueo de validación
}

function validateMoviePartial (input) {
  // partial() viene de TypeScript, y valida solo las partes que si estan en el input
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie, validateMoviePartial
}
