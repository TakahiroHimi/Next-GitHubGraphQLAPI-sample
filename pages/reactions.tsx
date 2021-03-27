import { GraphQLClient } from "graphql-request";
import React, { FC } from "react";
import useSWR from "swr";
import { getIssueReactionsQuery, getViewerQuery } from "./queries";

const repositoryOwner = "octocat"; // 取得するリポジトリのオーナー
const repositoryName = "Hello-World"; // 取得するリポジトリの名前
const issueNumber = 349; // 取得するIssueのNo
const reactionsLast = 100; // 取得するリアクションの件数

type Props = {
  client: GraphQLClient;
  reaction: string;
};

type Viewer = {
  viewer: {
    id: string;
  };
};

type Repository = {
  repository: {
    issue: {
      reactions: {
        edges: [
          {
            node: {
              createdAt: string;
              content: string;
              user: {
                id: string;
              };
            };
          }
        ];
      };
    };
  };
};

const Reactions: FC<Props> = ({ client, reaction }) => {
  const { data: viewerData, error: viewerError } = useSWR<Viewer>(
    getViewerQuery,
    (query) => client.request(query)
  );
  const { data: reactionsData, error: reactionsError } = useSWR<Repository>(
    [getIssueReactionsQuery, reaction],
    (query) =>
      client.request(query, {
        repositoryOwner: repositoryOwner,
        repositoryName: repositoryName,
        issueNumber: issueNumber,
        reactionsContent: reaction,
        reactionsLast: reactionsLast,
      })
  );

  if (viewerError || reactionsError) return <>failed to load</>;
  if (!viewerData || !reactionsData) return <>loading...</>;
  return (
    <>
      {reactionsData?.repository.issue.reactions.edges.find(
        (reaction) => reaction.node.user.id === viewerData.viewer.id
      ) && "Reaction!"}
    </>
  );
};

export default Reactions;
