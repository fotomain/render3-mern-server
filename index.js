
import express from "express"
import cors from 'cors'

import pkg from 'apollo-server-express'
const { ApolloServer, startStandaloneServer } = pkg
// import { ApolloServer } from '@apollo/server'
// import { startStandaloneServer } from '@apollo/server/standalone'

// data
import db from './apollo_games/_db.js'

// types
import { typeDefs } from './apollo_games/schema.js'

const app = express();

// resolvers
const resolvers = {
  Query: {
    games() {
      return db.games //createGameAdapter
    },
    game(_, args) {
      return db.games.find((game) => game.id === args.id)
    },
    authors() {
      return db.authors
    },
    author(_, args) {
      return db.authors.find((author) => author.id === args.id)
    },
    reviews() {
      return db.reviews
    },
    review(_, args) {
      return db.reviews.find((review) => review.id === args.id)
    }
  },
  Game: {
    reviews(parent) {
      return db.reviews.filter((r) => r.game_id === parent.id)
    }
  },
  Review: {
    author(parent) {
      return db.authors.find((a) => a.id === parent.author_id)
    },
    game(parent) {
      return db.games.find((g) => g.id === parent.game_id)
    }
  },
  Author: {
    reviews(parent) {
      return db.reviews.filter((r) => r.author_id === parent.id)
    }
  },
  Mutation: {
    createGame(_, args) {

      console.log("=== createGame args ",args)

      let game = {
        ...args.game,
      }

      if(!args.game.id || (""===args.game.id))
        game.id = Math.floor(Math.random() * 10000).toString()

      db.games.push(game)

      return game
    },
    deleteGame(_, args) {
      db.games = db.games.filter((g) => g.id !== args.id)

      return db.games
    },
    updateGame(_, args) {
      db.games = db.games.map((g) => {
        if (g.id === args.id) {
          return {...g, ...args.edits}
        }

        return g
      })

      return db.games.find((g) => g.id === args.id)
    }
  }
}


const ALLOWED_ORIGINS=
    'https://render3-mern-client.netlify.app ' +
    'http://localhost:3001 ' +
    'http://localhost:3000 ' +
    'http://localhost:4000 ' +
    'http://localhost:8080 '

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ALLOWED_ORIGINS.split(" ");
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("===== Express Cors -> Request from unauthorized origin"));
    }
  },
};


// server setup
const server = new ApolloServer({
  typeDefs,
  resolvers
})

// call srtongly here !!!
const productionMode= process.env.PRODUCTION_MODE || false
console.log("=== productionMode",productionMode)
if(productionMode) {
  app.use(cors(
      corsOptions
  ));
}
// ================
// ================ RUN productionWork
// ================

app.post('/testfetch', async (req, res) => {
  //test return to api call
  return res.status(200).json({response:'testfetch OK'});
});
app.get('/status', (_, res) => {
  //test show in browser
  res.status(200).json({ message: "All is fine!" })
});

// ================
// ================
// ================

await server.start()

// await startStandaloneServer(server, {
//   listen: { port: 4000 }
// })

server.applyMiddleware({ app, path: '/graphql' });

// server.applyMiddleware({ app });
// server.applyMiddleware({ app, cors: corsOptions });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`=========== Server listening on http://localhost:${PORT}`);
})


