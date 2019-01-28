import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'next/router';

import Page, { reduxConnect } from '../components/page';
import Layout from '../layouts/main';

const getPostQuery = gql`
  query getPost($id: Int!) {
    getPost(id: $id) {
      id
      title
      content
      publishedAt
    }
  }
`;

function errorNotFound() {
  const e = new Error('Not found');
  e.code = 'ENOENT';
  throw e;
}

class Post extends Page {
  static async getInitialProps(ctx) {
    const props = await super.getInitialProps(ctx);
    props.postId = ctx.query.id;
    return props;
  }

  render() {
    const postId = parseInt(this.props.postId, 10);

    if (Number.isNaN(postId)) errorNotFound();

    const getPostQueryVars = {
      id: postId
    };

    const { user } = this.props;

    return (
      <Layout {...this.props}>
        <Query query={getPostQuery} variables={getPostQueryVars}>
          {({
            loading, error, data: { getPost }
          }) => {
            if (error) return <div>Error loading post.</div>;
            if (loading) return <div>Loading</div>;

            if (!getPost) errorNotFound();

            return (
              <React.Fragment>
                <Head>
                  <title>{`Boiler - ${getPost.title}`}</title>
                </Head>
                <article>
                  <h1>{getPost.title}</h1>
                  <div>{getPost.publishedAt}</div>
                  {user ? (
                    <Link href={`/edit?id=${getPost.id}`}>
                      <a className="button">Edit Post</a>
                    </Link>
                  ) : ''}
                  <pre>{getPost.content}</pre>
                </article>
              </React.Fragment>
            );
          }}
        </Query>
        <style jsx>
          {`
            a {
              margin: 8px 0 24px 0;
            }
          `}
        </style>
      </Layout>
    );
  }
}

export default withRouter(reduxConnect(Post));
