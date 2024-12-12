export const typeDefs = `#graphql

  ## step1 - entities
  
  type Game {
    id: ID!
    title: String!
    platform: [String!]! 
    reviews: [Review!] ## step2 - cross links
  }
  type Review {
    id: ID!
    rating: Int!
    content: String!
    author: Author!
    game: Game!
  }
  type Author {
    id: ID!
    name: String!
    verified: Boolean!
    reviews: [Review!]
  }
  type Query {
    games: [Game]
    game(id: ID!): Game
    reviews: [Review]
    review(id: ID!): Review
    authors: [Author]
    author(id: ID!): Author
  }
  type Mutation {
    createGame(game: CreateGameInput!): Game
    deleteGame(id: ID!): [Game]
    updateGame(id: ID!, edits: EditGameInput): Game
  }
  input CreateGameInput {
    id: String,
    title: String!,
    platform: [String!]!
  }
  input EditGameInput {
    title: String,
    platform: [String!]
  }
`
