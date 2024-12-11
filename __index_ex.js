
const express = require("express");
var cors = require('cors');

const app = express();

require("dotenv").config();

const colors = require('colors');

// =============================
// =============================
// =============================


const ALLOWED_ORIGINS=
    'https://render2-client.netlify.app ' +
    'http://localhost:3001 ' +
    'http://localhost:3000 ' +
    'http://localhost:8080 '

const customCorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ALLOWED_ORIGINS.split(" ");
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Request from unauthorized origin"));
    }
  },
};


app.use(express.json());

const connectDB = require("./connectMongo");

connectDB();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const BookModel = require("./models/book.model");

// ====================
// ====================
// ====================

const schema = require('./grapql_schema/schema');

const { graphqlHTTP } = require('express-graphql');

app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      graphiql: true,
      // graphiql: process.env.NODE_ENV === 'development',
    })
);

app.use(cors(
    customCorsOptions
));


app.post('/api/v1/schema_settings', (req, res,next) => {
  console.log('=== post schema_settings  ')
  res.json({schema});
});

// ====================
// ====================
// ====================


app.get("/api/v1/books", async (req, res) => {
  const { limit = 5, orderBy = "name", sortBy = "asc", keyword } = req.query;
  let page = +req.query?.page;

  if (!page || page <= 0) page = 1;

  const skip = (page - 1) * + limit;

  const query = {};

  if (keyword) query.name = { $regex: keyword, $options: "i" };

  const key = `Book::${JSON.stringify({query, page, limit, orderBy, sortBy})}`
  let response = null
  try {
      const create1 = await BookModel.create({name:'Book111'})
      const data = await BookModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [orderBy]: sortBy });
      const totalItems = await BookModel.countDocuments(query);

      response = {
        msg: "Ok",
        apiname: "create1",
        create1,
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        limit: +limit,
        currentPage: page,
      }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.get("/api/v1/books/:id", async (req, res) => {
  try {
    const data = await BookModel.findById(req.params.id);

    if (data) {
      return res.status(200).json({
        msg: "Ok",
        apiname: "findById",
        data,
      });
    }

    return res.status(404).json({
      msg: "Not Found",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.post("/api/v1/books", async (req, res) => {
  try {
    var { name, author, price, description } = req.body;
    if(!name ) name = 'no name'
    if(!price ) price = 0
    const book = new BookModel({
      name,
      author,
      price,
      description,
    });
    const data = await book.save();
    // deleteKeys('Book')
    return res.status(200).json({
      msg: "Ok",
      apiname: "save",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.put("/api/v1/books/:id", async (req, res) => {
  try {
    const { name, author, price, description } = req.body;
    const { id } = req.params;

    const data = await BookModel.findByIdAndUpdate(
      id,
      {
        name,
        author,
        price,
        description,
      },
      { new: true }
    );
    // deleteKeys('Book')
    return res.status(200).json({
      msg: "Ok",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

app.delete("/api/v1/books/:id", async (req, res) => {
  try {
    await BookModel.findByIdAndDelete(req.params.id);
    // deleteKeys('Book')
    return res.status(200).json({
      msg: "Ok",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
