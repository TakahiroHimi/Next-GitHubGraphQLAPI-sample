import { GraphQLClient, gql } from "graphql-request";
import useSWR, { mutate } from "swr";
import { signIn, signOut, useSession } from "next-auth/client";
import { addReactionQuery } from "./queries";
import { useState } from "react";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL

const subjectId = "MDU6SXNzdWUyMzEzOTE1NTE="; // リアクションするIssueのID(https://github.com/octocat/Hello-World/issues/349)
const content = "HOORAY"; // 付与するリアクションの種類

const client = new GraphQLClient(API);

const addReaction = (accessToken: string) => {
  void client.request(addReactionQuery, {
    addReactionInput: {
      subjectId: subjectId,
      content: content,
    },
  });
};

const IssuesPage = () => {
  const [session, loading] = useSession();
  // const { data, error } = useSWR([JOB_POST_BY_ID_QUERY, id], (query, id) => request('/api', query, { id }));

  // const { data, error, revalidate, isValidating, mutate } = useSWR();

  if (session) {
    client.setHeader("Authorization", "bearer " + session.accessToken);
  }

  return (
    <>
      <>
        {!session && (
          <>
            {loading ? (
              <>Loading ...</>
            ) : (
              <>
                Not signed in <br />
                <button onClick={() => signIn()}>Sign in</button>
              </>
            )}
          </>
        )}
        {session && (
          <>
            Signed in as <img src={session.user.image ?? ""} width="50px" />　
            {session.user.name} <br />
            <button onClick={() => signOut()}>Sign out</button>
            <br />
            <button onClick={() => addReaction(session.accessToken ?? "")}>
              Add Reaction!
            </button>
          </>
        )}
      </>
    </>
  );
};

export default IssuesPage;
