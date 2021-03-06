import { GraphQLClient } from "graphql-request";
import React, { FC } from "react";
import useSWR from "swr";
import { issueNumber, reactionsLast, repositoryName, repositoryOwner } from ".";
import { getIssueReactionsQuery, getViewerQuery } from "../query/queries";

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
            cursor: string;
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

const ReactoinStatus: FC<Props> = ({ client, reaction }) => {
  const { data: viewerData, error: viewerError } = useSWR<Viewer>(
    getViewerQuery,
    (query) => client.request(query)
  );
  const { data: reactionsData, error: reactionsError } = useSWR<Repository>(
    [
      getIssueReactionsQuery,
      repositoryOwner,
      repositoryName,
      issueNumber,
      reaction,
      reactionsLast,
    ],
    (query, owner, name, number, content, last) =>
      client.request(query, {
        repositoryOwner: owner,
        repositoryName: name,
        issueNumber: number,
        reactionsContent: content,
        reactionsLast: last,
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

export default ReactoinStatus;
