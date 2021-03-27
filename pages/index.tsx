import { GraphQLClient } from "graphql-request";
import { mutate } from "swr";
import { signIn, signOut, useSession } from "next-auth/client";
import {
  addReactionQuery,
  getIssueReactionsQuery,
  getViewerQuery,
} from "./queries";
import { useEffect, useState } from "react";
import Reactoins from "./reactions";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL
const subjectId = "MDU6SXNzdWUyMzEzOTE1NTE="; // リアクションするIssueのID(https://github.com/octocat/Hello-World/issues/349)

const client = new GraphQLClient(API);

type Viewer = {
  viewer: {
    id: string;
  };
};

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

const addReaction = (content: string) => {
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

const IssuesPage = () => {
  const [session, loading] = useSession();
  const [viewerId, setViewerId] = useState<string>();

  useEffect(() => {
    (async () => {
      if (session) {
        const setHeader = async () => {
          client.setHeader("Authorization", "bearer " + session.accessToken);
        };
        await setHeader();

        const viewer = await client.request<Viewer>(getViewerQuery);
        void setViewerId(viewer.viewer.id);
      }
    })();
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
      {session && viewerId && (
        <>
          Signed in as <img src={session.user.image ?? ""} width="50px" />　
          {session.user.name} <br />
          <button onClick={() => signOut()}>Sign out</button>
          <br />
          <br />
          {reactions.map((reaction) => {
            return (
              <>
                <button
                  key={reaction.reaction}
                  onClick={() => addReaction(reaction.reaction)}
                >
                  {reaction.pictograph}
                </button>
                {viewerId && (
                  <Reactoins
                    key={reaction.reaction + "Status"}
                    client={client}
                    viewerId={viewerId}
                    reaction={reaction.reaction}
                  />
                )}
                <br />
              </>
            );
          })}
        </>
      )}
    </>
  );
};

export default IssuesPage;
