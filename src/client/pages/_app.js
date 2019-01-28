import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';

import withReduxStore from '../lib/with-redux-store';
import withApolloClient from '../lib/with-apollo-client';

class MyApp extends App {
  render() {
    const {
      Component, pageProps, apolloClient, reduxStore
    } = this.props;

    return (
      <Container>
        <Provider store={reduxStore}>
          <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </Provider>
      </Container>
    );
  }
}

export default withApolloClient(withReduxStore(MyApp));
