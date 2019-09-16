import gql from 'graphql-tag';
import { t } from 'ttag';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';

import AppLayout from 'components/AppLayout';
import Hyperlinks from 'components/Hyperlinks';
import ArticleInfo from 'components/ArticleInfo';
import Trendline from 'components/Trendline';
import withData from 'lib/apollo';

import { nl2br, linkify } from 'lib/text';

const LOAD_ARTICLE = gql`
  query LoadArticlePage($id: String!) {
    GetArticle(id: $id) {
      id
      text
      replyRequestCount
      replyCount
      createdAt
      references {
        type
      }
      hyperlinks {
        ...HyperlinkData
      }
    }
  }
  ${Hyperlinks.fragments.hyperlink}
`;

function ArticlePage({ query }) {
  const { data, loading } = useQuery(LOAD_ARTICLE, {
    variables: { id: query.id },
  });

  if (loading) {
    return <AppLayout>Loading...</AppLayout>;
  }

  if (!data?.GetArticle) {
    return <AppLayout>Article not found.</AppLayout>;
  }

  const article = data.GetArticle;

  const slicedArticleTitle = article.text.slice(0, 15);

  return (
    <AppLayout>
      <Head>
        <title>{slicedArticleTitle}⋯⋯ | Cofacts 真的假的</title>
      </Head>
      <section className="section">
        <header className="header">
          <h2>{t`Reported Message`}</h2>
          <div className="trendline">
            <Trendline id={article.id} />
          </div>
          <ArticleInfo article={article} />
        </header>
        <article className="message">
          {nl2br(
            linkify(article.text, {
              props: {
                target: '_blank',
              },
            })
          )}
          <Hyperlinks hyperlinks={article.hyperlinks} />
        </article>
      </section>

      <style jsx>{`
        .section {
          margin-bottom: 64px;
        }
        .header {
          display: flex;
          align-items: center;
          flex-flow: row wrap;
        }
        .header > .trendline {
          margin: 0 16px 0 auto;
        }
        .message {
          border: 1px solid #ccc;
          background: #eee;
          border-radius: 3px;
          padding: 24px;
          word-break: break-all;
        }
        .items {
          list-style-type: none;
          padding-left: 0;
        }
      `}</style>
    </AppLayout>
  );
}

ArticlePage.getInitialProps = ({ query }) => ({ query });

export default withData(ArticlePage);
