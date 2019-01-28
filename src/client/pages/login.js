import React from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'next/router';

import Page, { reduxConnect } from '../components/page';
import Layout from '../layouts/main';
import parseJwt from '../lib/jwt';
import { setUser } from '../store';

class Login extends Page {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event, client) {
    const { dispatch } = this.props;

    event.preventDefault();
    const form = event.target;
    const formData = new window.FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await client.mutate({
        mutation: gql`
          mutation login($email: String!, $password: String!) {
            login(email: $email, password: $password)
          }
        `,
        variables: { email, password },
        refetchQueries: [{
          query: gql`
            query getPosts {
              getPosts {
                id
                title
                publishedAt
              }
            }
          `
        }]
      });

      if (response.data && response.data.login) {
        const user = parseJwt(response.data.login);
        dispatch(setUser({ id: user.id, email: user.email }));

        this.props.router.push('/');

        form.reset();
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
              <h1>Login</h1>
              <input placeholder="email" name="email" type="text" required />
              <input placeholder="password" name="password" type="password" required />
              <button type="submit">Login</button>
              <style jsx>
                {`
            input {
              display: block;
              margin-bottom: 10px;
            }
          `}
              </style>
            </form>
          )}
        </ApolloConsumer>
      </Layout>
    );
  }
}

export default withRouter(reduxConnect(Login));
