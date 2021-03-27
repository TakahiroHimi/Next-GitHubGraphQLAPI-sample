import { GraphQLClient } from "graphql-request";
import { mutate } from "swr";
import { signIn, signOut, useSession } from "next-auth/client";
import {
  addReactionQuery,
  getIssueReactionsQuery,
  removeReactionQuery,
} from "./queries";
import { useEffect, useState } from "react";
import Reactoins from "./reactions";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL
const subjectId = "MDU6SXNzdWUyMzEzOTE1NTE="; // リアクションするIssueのID(https://github.com/octocat/Hello-World/issues/349)

const reactions = [
  { reaction: "THUMBS_UP", pictograph: "👍" },
  { reaction: "THUMBS_DOWN", pictograph: "👎" },
  { reaction: "LAUGH", pictograph: "😄" },
  { reaction: "HOORAY", pictograph: "🎉" },
  { reaction: "CONFUSED", pictograph: "😕" },
  { reaction: "HEART", pictograph: "❤️" },
  { reaction: "ROCKET", pictograph: "🚀" },
  { reaction: "EYES", pictograph: "👀" },
] as {
  reaction: string;
  pictograph: string;
}[];

const addReaction = (client: GraphQLClient, content: string) => {
  const action = async () => {
    await client.request(addReactionQuery, {
      addReactionInput: {
        subjectId: subjectId,
        content: content,
      },
    });
    await mutate([getIssueReactionsQuery, content]);
  };

  void action();
};

const removeReaction = (client: GraphQLClient, content: string) => {
  const action = async () => {
    await client.request(removeReactionQuery, {
      removeReactionInput: {
        subjectId: subjectId,
        content: content,
      },
    });
    await mutate([getIssueReactionsQuery, content]);
  };

  void action();
};

const IssuesPage = () => {
  const [session, loading] = useSession();
  const [client, setClient] = useState<GraphQLClient>();

  useEffect(() => {
    if (session) {
      setClient(
        new GraphQLClient(API, {
          headers: [["Authorization", "bearer " + session.accessToken]],
        })
      );
    }
  }, [session]);

  return (
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
      {session && client && (
        <>
          Signed in as <img src={session.user.image ?? ""} width="50px" />　
          {session.user.name} <br />
          <button onClick={() => signOut()}>Sign out</button>
          <br />
          <br />
          {reactions.map((reaction) => {
            return (
              <div key={reaction.reaction + "Status"}>
                <button
                  key={reaction.reaction}
                  onClick={() => addReaction(client, reaction.reaction)}
                >
                  {reaction.pictograph}
                </button>
                <button
                  key={reaction.reaction}
                  onClick={() => removeReaction(client, reaction.reaction)}
                  style={{ backgroundColor: "gray" }}
                >
                  {reaction.pictograph}
                </button>
                <Reactoins client={client} reaction={reaction.reaction} />
                <br />
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

export default IssuesPage;
