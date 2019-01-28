import React from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'next/router';

import Page, { reduxConnect } from '../components/page';
import Layout from '../layouts/main';
import { postsQuery } from './index';

class NewPostPage extends Page {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      content: '',
      published: false
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

    const { title, content, published } = this.state;

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation addPost($title: String!, $content: String!, $published: Boolean!) {
            addPost(title: $title, content: $content, published: $published) {
              id
              title
              publishedAt
            }
          }
        `,
        variables: { title, content, published },
        update: (proxy, { data: { addPost } }) => {
          const data = proxy.readQuery({
            query: postsQuery
          });

          proxy.writeQuery({
            query: postsQuery,
            data: {
              ...data,
              getPosts: [addPost, ...data.getPosts]
            }
          });
        }
      });

      if (response.data && response.data.addPost) {
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
              <h1>New post</h1>
              <input
                placeholder="title"
                name="title"
                type="text"
                onChange={this.handleInputChanged}
                required
              />
              <textarea
                placeholder="content"
                name="content"
                cols="40"
                rows="5"
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

              <button type="submit">Create post</button>
            </form>
          )}
        </ApolloConsumer>
      </Layout>
    );
  }
}

export default withRouter(reduxConnect(NewPostPage));
