const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

// Set up middleware to parse JSON request bodies
app.use(express.json());

// Configure CORS to allow requests from localhost:5173
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/design-data', async(req, res) =>{
  console.log(req.body)

  res.status(200).json({
    yourDesignLink: "https://res.cloudinary.com/deqyxkw0y/image/upload/v1712413532/cld-sample-4.jpg"
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})