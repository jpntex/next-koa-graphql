import React from 'react';
import { connect } from 'react-redux';
import { startSession } from '../store';

class Page extends React.Component {
  static getInitialProps({ reduxStore, req, res }) {
    const isServer = !!req;
    reduxStore.dispatch(startSession(isServer, res));

    return {};
  }
}

export function reduxConnect(Component) {
  return connect(
    (state) => {
      const { user } = state;
      return { user };
    }
  )(Component);
}

export default reduxConnect(Page);
