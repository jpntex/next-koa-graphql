import React from 'react';
import Head from 'next/head';
import { getDataFromTree } from 'react-apollo';
import initApollo from './init-apollo';

export default App => class Apollo extends React.Component {
  // static displayName = 'withApollo(App)'
  static async getInitialProps(appContext) {
    const { Component, router } = appContext;

    let headers = {};
    if (!process.browser && appContext.ctx.req) {
      headers = { ...appContext.ctx.req.headers };
    }

    // Run all GraphQL queries in the component tree
    // and extract the resulting data
    const apollo = initApollo({}, headers);

    // Provide the client to getInitialProps of pages
    appContext.ctx.apolloClient = apollo;

    let appProps = {};
    if (typeof App.getInitialProps === 'function') {
      appProps = await App.getInitialProps(appContext);
    }

    if (!process.browser) {
      try {
        // Run all GraphQL queries
        await getDataFromTree(
          <App
            {...appProps}
            Component={Component}
            router={router}
            apolloClient={apollo}
          />
        );
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
        // Handle them in components via the data.error prop:
        // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
        if (error.code !== 'ENOENT') {
          console.error('Error while running `getDataFromTree`', error);
        }
      }

      // getDataFromTree does not call componentWillUnmount
      // head side effect therefore need to be cleared manually
      Head.rewind();
    }

    // Extract query data from the Apollo store
    const apolloState = apollo.cache.extract();

    return {
      ...appProps,
      apolloState
    };
  }

  constructor(props) {
    super(props);
    this.apolloClient = initApollo(props.apolloState, {});
  }

  render() {
    return <App {...this.props} apolloClient={this.apolloClient} />;
  }
};
