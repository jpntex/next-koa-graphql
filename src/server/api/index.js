const { ApolloServer, gql } = require('apollo-server-koa');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { db, schemas } = require('../db/models');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    getUsers: [User]
    getUser(id: Int!): User
    getPosts: [Post]
    getPost(id: Int!): Post
  }

  type Mutation {
    login (
      email: String!,
      password: String!
    ): String
    createUser (
      name: String,
      email: String!,
      password: String!
    ): User
    updateUser (
      id: Int!,
      name: String,
      email: String!,
      password: String!
    ): User
    addPost (
      title: String!,
      content: String!,
      published: Boolean
    ): Post
    updatePost (
      id: Int!,
      title: String!,
      content: String!,
      published: Boolean
    ): Post
    deletePost (id: Int!): Boolean
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    // Fetch all users
    getUsers() {
      return db.user.findAll();
    },

    // Get a user by it ID
    getUser(_, { id }) {
      return db.user.findById(id);
    },
    // Fetch all posts
    getPosts(_, __, { authUser }) {
      const query = {
        order: [['createdAt', 'DESC']]
      };

      if (!authUser) {
        query.where = {
          published: true
        };
      }

      return db.post.findAll(query);
    },
    // Get a post by it ID
    getPost(_, { id }, { authUser }) {
      const query = {
        where: { id }
      };

      if (!authUser) {
        query.where.published = true;
      }

      return db.post.findOne(query);
    }
  },
  Mutation: {
    // Handles user login
    async login(_, { email, password }, { ctx }) {
      const user = await db.user.findOne({ where: { email } });
      if (!user) {
        throw new Error('Incorrect email/password');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Incorrect email/password');
      }

      // Return json web token
      const token = jwt.sign({
        id: user.id,
        email: user.email
      }, process.env.JWT_SECRET, { expiresIn: '7d' });

      const date = new Date();
      date.setDate(date.getDate() + 7);
      ctx.cookies.set('token', token, {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7
      });

      return token;
    },

    // Create new user
    async createUser(_, {
      name, email, password
    }) {
      return db.user.create({
        name,
        email,
        password: await bcrypt.hash(password, 10)
      });
    },

    // Update a particular user
    async updateUser(_, {
      id, name, email, password
    }, { authUser }) {
      // Make sure user is logged in
      if (!authUser) {
        throw new Error('You must log in to continue!');
      }
      // fetch the user by it ID
      const user = await db.user.findById(id);
      // Update the user
      await user.update({
        name,
        email,
        password: await bcrypt.hash(password, 10)
      });
      return user;
    },

    // Add a new post
    async addPost(_, {
      title, content, published
    }, { authUser }) {
      // Make sure user is logged in
      if (!authUser) {
        throw new Error('You must log in to continue!');
      }
      const user = await db.user.findOne({ where: { id: authUser.id } });

      return db.post.create({
        userId: user.id,
        title,
        content,
        published
      });
    },

    // Update a particular post
    async updatePost(_, {
      id, title, content, published
    }, { authUser }) {
      // Make sure user is logged in
      if (!authUser) {
        throw new Error('You must log in to continue!');
      }
      // fetch the post by it ID
      const post = await db.post.findById(id);
      // Update the post
      return post.update({
        title,
        content,
        published
      });
    },

    // Delete a specified post
    async deletePost(_, { id }, { authUser }) {
      // Make sure user is logged in
      if (!authUser) {
        throw new Error('You must log in to continue!');
      }
      // fetch the post by it ID
      const post = await db.post.findById(id);
      return post.destroy();
    }
  },

  User: {
    // Fetch all posts created by a user
    posts(user) {
      return user.getPosts();
    }
  },
  Post: {
    // Fetch the author of a particular post
    user(post) {
      return post.getUser();
    }
  },
};

const apolloServer = new ApolloServer({
  typeDefs: [typeDefs].concat(schemas),
  resolvers,
  // schema,
  introspection: process.env.NODE_ENV !== 'production',
  // Make graphql playgroud available
  playground: process.env.NODE_ENV !== 'production',
  // context with authorization
  context: ({ ctx }) => {
    const context = {
      ctx
    };

    const token = ctx.cookies.get('token');
    if (token) {
      const { id, email } = jwt.verify(token, process.env.JWT_SECRET);

      if (!id || !email) { throw new Error('Invalid token'); }

      context.authUser = {
        id,
        email
      };
    }

    return context;
  }
});

module.exports = apolloServer;
