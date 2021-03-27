import { GraphQLClient } from "graphql-request";
import { mutate } from "swr";
import { signIn, signOut, useSession } from "next-auth/client";
import { addReactionQuery, getViewerQuery } from "./queries";
import { useEffect, useState } from "react";
import Reactoins from "./reactions";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL

const subjectId = "MDU6SXNzdWUyMzEzOTE1NTE="; // リアクションするIssueのID(https://github.com/octocat/Hello-World/issues/349)
const content = "EYES"; // 付与するリアクションの種類

const client = new GraphQLClient(API);

type Viewer = {
  viewer: {
    id: string;
  };
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
  const [viewerId, setViewerId] = useState<string>();

  useEffect(() => {
    const setAccount = async () => {
      if (session) {
        const setHeader = async () => {
          client.setHeader("Authorization", "bearer " + session.accessToken);
        };
        await setHeader();

        const viewer = await client.request<Viewer>(getViewerQuery);
        void setViewerId(viewer.viewer.id);
      }
    };
    void setAccount();
  }, [session]);

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
            {viewerId && <Reactoins client={client} viewerId={viewerId} />}
            <br />
            <button onClick={() => addReaction()}>Add Reaction!</button>
          </>
        )}
      </>
    </>
  );
};

export default IssuesPage;
