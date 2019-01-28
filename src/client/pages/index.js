import React from 'react';
import Link from 'next/link';

import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Page, { reduxConnect } from '../components/page';
import Layout from '../layouts/main';

export const postsQuery = gql`
  query getPosts {
    getPosts {
      id
      title
      publishedAt
    }
  }
`;

class Index extends Page {
  render() {
    return (
      <Layout {...this.props}>
        <Query query={postsQuery}>
          {({
            loading, error, data: { getPosts }
          }) => {
            if (error) return <div>Error loading posts.</div>;
            if (loading) return <div>Loading</div>;

            return (
              <section>
                {getPosts.map(post => (
                  <div className="post-link" key={post.id}>
                    <Link href={`/post?id=${post.id}`}>
                      <a>
                        <h2>{post.title}</h2>
                        <div>{post.publishedAt}</div>
                      </a>
                    </Link>
                  </div>
                ))}
              </section>
            );
          }}
        </Query>
        <style jsx>
          {`
            .post-link {
              margin: 20px 0;
            }

            .post-link div {
              color: rgba(0, 0, 0, .85);
            }
          `}
        </style>
      </Layout>
    );
  }
}

export default reduxConnect(Index);
