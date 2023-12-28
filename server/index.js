const express = require('express')
require('dotenv').config()
const port = process.env.PORT || 5000
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema')
const colors = require('colors')
const connectDB = require('./config/db')
const cors = require('cors')

// Variable
const app = express();


// Database Connection
connectDB();

// Middleware
app.use(cors())

// API Endpoints
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'
}))

app.listen(port, () => {
    console.log(`server running on port ${port}`)
})