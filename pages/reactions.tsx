import { GraphQLClient } from "graphql-request";
import React, { FC } from "react";
import useSWR from "swr";
import { getIssueReactionsQuery } from "./queries";

type Props = {
  client: GraphQLClient;
  viewerId: string;
  reaction: string;
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

const Reactions: FC<Props> = ({ client, viewerId, reaction }) => {
  const { data, error } = useSWR<Repository>(
    [getIssueReactionsQuery, reaction],
    (query) =>
      client.request(query, {
        repositoryOwner: "octocat",
        repositoryName: "Hello-World",
        issueNumber: 349,
        reactionsContent: reaction,
        reactionsLast: 100,
      })
  );

  console.log(reaction, data);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return (
    <>
      {data?.repository.issue.reactions.edges.find(
        (reaction) => reaction.node.user.id === viewerId
      ) && "Reactioned!"}
    </>
  );
};

export default Reactions;
