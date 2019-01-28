import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { withRouter } from 'next/router';

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      title, children, user, router: { pathname }
    } = this.props;

    return (
      <React.Fragment>
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title || 'Boiler'}</title>
          <link href="/static/core.css" rel="stylesheet" />
        </Head>

        <header>
          <div className="content">
            <Link href="/">
              <a className="logo">
                Boiler
              </a>
            </Link>

            {user ? (
              <div>
                <Link href="/new">
                  <a className="button">New Post</a>
                </Link>

                <a href="/signout">Sign Out</a>
              </div>
            )
              : (
                <Link href="/login">
                  <a className={pathname === '/login' ? 'is-active' : ''}>Sign In</a>
                </Link>
              )}
          </div>
        </header>

        <div className="content">{children}</div>

      </React.Fragment>
    );
  }
}

export default withRouter(Layout);
