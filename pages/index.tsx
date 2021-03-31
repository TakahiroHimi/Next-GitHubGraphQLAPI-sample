import { GraphQLClient } from "graphql-request";
import { mutate } from "swr";
import { signIn, signOut, useSession } from "next-auth/client";
import {
  addReactionQuery,
  getIssueReactionsQuery,
  removeReactionQuery,
} from "../query/queries";
import { useEffect, useState } from "react";
import ReactoinStatus from "./reactionStatus";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL
const subjectId = "MDU6SXNzdWUyMzEzOTE1NTE="; // リアクションするIssueのID(https://github.com/octocat/Hello-World/issues/349)
export const repositoryOwner = "octocat"; // 取得するリポジトリのオーナー
export const repositoryName = "Hello-World"; // 取得するリポジトリの名前
export const issueNumber = 349; // 取得するIssueのNo
export const reactionsLast = 100; // 取得するリアクションの件数

// Issueへのリアクション一覧
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

/**
 * Issueへリアクションを追加する関数
 */
const addReaction = async (client: GraphQLClient, content: string) => {
  await client.request(addReactionQuery, {
    addReactionInput: {
      subjectId: subjectId,
      content: content,
    },
  });
  void mutate([
    getIssueReactionsQuery,
    repositoryOwner,
    repositoryName,
    issueNumber,
    content,
    reactionsLast,
  ]);
};

/**
 * Issueからリアクションを削除する関数
 */
const removeReaction = async (client: GraphQLClient, content: string) => {
  await client.request(removeReactionQuery, {
    removeReactionInput: {
      subjectId: subjectId,
      content: content,
    },
  });
  void mutate([
    getIssueReactionsQuery,
    repositoryOwner,
    repositoryName,
    issueNumber,
    content,
    reactionsLast,
  ]);
};

const Index = () => {
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
                  onClick={() => void addReaction(client, reaction.reaction)}
                >
                  {reaction.pictograph}
                </button>
                <button
                  key={reaction.reaction}
                  onClick={() => void removeReaction(client, reaction.reaction)}
                  style={{ backgroundColor: "gray" }}
                >
                  {reaction.pictograph}
                </button>
                <ReactoinStatus client={client} reaction={reaction.reaction} />
                <br />
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

export default Index;
