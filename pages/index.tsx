import { GraphQLClient, gql } from "graphql-request";
import useSWR, { mutate } from "swr";
import { signIn, signOut, useSession } from "next-auth/client";
import { addReactionQuery, getViewerQuery } from "./queries";
import { useState } from "react";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL

const subjectId = "MDU6SXNzdWUyMzEzOTE1NTE="; // リアクションするIssueのID(https://github.com/octocat/Hello-World/issues/349)
const content = "HOORAY"; // 付与するリアクションの種類

const client = new GraphQLClient(API);

type Viewer = {
  viewer: {
    id: string;
  };
};

const getViewerId = async () => {
  const viewer = await client.request<Viewer>(getViewerQuery);
  return viewer.viewer.id;
};

const addReaction = () => {
  void client.request(addReactionQuery, {
    addReactionInput: {
      subjectId: subjectId,
      content: content,
    },
  });
};

const IssuesPage = () => {
  const [session, loading] = useSession();
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
