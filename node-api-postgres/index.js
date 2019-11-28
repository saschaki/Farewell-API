const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')
//security
const helmet = require('helmet') //secure HTTP headers in an Express app
const compression = require('compression') // compression middleware
const rateLimit = require('express-rate-limit') //limit repeated requests to endpoints
const { body, check } = require('express-validator') // string validators and santizers
//

const app = express()
//========= SECURITY ==================
//only use cors in development to make it available from any browser
//does NOT protect from cURL and Postmen
const isProduction = process.env.NODE_ENV === 'production'
const origin = {
  origin: isProduction ? 'https://www.example.com' : '*',
}
app.use(cors(origin))
app.use(compression())
app.use(helmet())
//Rate limiting to protect against brute force/DDoS
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, //  max number of requests per 1 minute         
  max: 5, // only 5 requests per client,
})
app.use(limiter)   //applies to every endpoint
const postLimiter = rateLimit({ //stricter endpoint restriction
  windowMs: 1 * 60 * 1000,
  max: 1,
})

//express validation to ensure incoming request is valid
app.post(
  '/quotes',
  [
    check('author')
      .not()
      .isEmpty()
      .isLength({ min: 5, max: 255 })
      .trim(),
    check('quote')
      .not()
      .isEmpty()
      .isLength({ min: 5, max: 255 })
      .trim(),
  ],
  postLimiter,
  (request, response) => {
    const errors = validationResult(request)

    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() })
    }

    const { author, quote } = request.body

    pool.query('INSERT INTO quotes (author, quote) VALUES ($1, $2)', [author, quote], error => {
      if (error) {
        throw error
      }
      response.status(201).json({ status: 'success', message: 'Quote added.' })
    })
  }
)

//if header doesn't have avalid API key return an unauthorized error
const deleteQuote = (request, response) => {
  if (!request.header('apiKey') || request.header('apiKey') !== process.env.API_KEY) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized.' })
  }
  // ...
}

//===================================
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const getQuotes = (request, response) => {
  pool.query('SELECT * FROM quotes', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const addQuote = (request, response) => {
  const { author, quote } = request.body

  pool.query('INSERT INTO quotes (author, quote) VALUES ($1, $2)', [author, quote], error => {
    if (error) {
      throw error
    }
    response.status(201).json({ status: 'success', message: 'Quote added.' })
  })
}

app
  .route('/quotes')
  // GET endpoint
  .get(getQuotes)
  // POST endpoint
  .post(addQuote)

// Start server
app.listen(process.env.PORT || 4000, () => {
  console.log(`Server listening`)
})
 