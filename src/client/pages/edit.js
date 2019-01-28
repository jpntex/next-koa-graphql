import React from 'react';
import gql from 'graphql-tag';
import { withRouter } from 'next/router';
import { ApolloConsumer } from 'react-apollo';

import Page, { reduxConnect } from '../components/page';
import Layout from '../layouts/main';

const getPostQuery = gql`
  query getPost($id: Int!) {
    getPost(id: $id) {
      id
      title
      content
      published
    }
  }
`;

function errorNotFound() {
  const e = new Error('Not found');
  e.code = 'ENOENT';
  throw e;
}

class Login extends Page {
  static async getInitialProps(ctx) {
    const props = await super.getInitialProps(ctx);

    const postId = parseInt(ctx.query.id, 10);
    if (Number.isNaN(postId)) return errorNotFound();

    props.id = postId;

    try {
      const { data } = await ctx.apolloClient.query({
        query: getPostQuery,
        variables: { id: props.id }
      });

      const { title, content, published } = data.getPost;
      props.title = title;
      props.content = content;
      props.published = published;
    } catch ({ graphQLErrors, networkError }) {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ));
      }

      if (networkError) console.log(`[Network error]: ${networkError}`);
    }

    return props;
  }

  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      title: props.title,
      content: props.content,
      published: props.published
    };

    this.handleInputChanged = this.handleInputChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChanged(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [target.name]: value
    });
  }

  async handleSubmit(event, client) {
    event.preventDefault();

    const {
      id, title, content, published
    } = this.state;

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation updatePost($id: Int!, $title: String!, $content: String!, $published: Boolean!) {
            updatePost(id: $id, title: $title, content: $content, published: $published) {
              id
              title
              __typename
              content
              published
              publishedAt
            }
          }
        `,
        variables: {
          id, title, content, published
        },
        // optimisticResponse: {
        //   __typename: 'Mutation',
        //   updatePost: {
        //     __typename: 'Post',
        //     id,
        //     title,
        //     content,
        //     published
        //   }
        // }
      });

      if (response.data && response.data.updatePost) {
        this.props.router.push('/');
      }
    } catch (er) {
      const { graphQLErrors, networkError } = er;

      console.log(er);

      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) => console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ));
      }

      if (networkError) console.log(`[Network error]: ${networkError}`);
    }
  }

  render() {
    return (
      <Layout {...this.props}>
        <ApolloConsumer>
          {client => (
            <form onSubmit={event => this.handleSubmit(event, client)}>
              <h1>Edit post</h1>
              <input
                placeholder="title"
                name="title"
                type="text"
                value={this.state.title}
                onChange={this.handleInputChanged}
                required
              />
              <textarea
                placeholder="content"
                name="content"
                cols="40"
                rows="5"
                value={this.state.content}
                onChange={this.handleInputChanged}
                required
              />
              <label htmlFor="published">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={this.state.published}
                  onChange={this.handleInputChanged}
                />
                Published
              </label>

              <button type="submit">Update post</button>
            </form>
          )}
        </ApolloConsumer>
      </Layout>
    );
  }
}

export default withRouter(reduxConnect(Login));
