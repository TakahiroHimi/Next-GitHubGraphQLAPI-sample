import { GraphQLClient } from "graphql-request";
import useSWR from "swr";

const API = "https://api.github.com/graphql"; // GraphQLエンドポイントのURL
const repositoryOwner = "octocat"; // 取得するリポジトリ所有者のユーザー名
const repositoryName = "Hello-World"; // 取得するリポジトリの名前
const issuesFirst = 100; // 取得するIssueの数

const query = `
query GetRepository($repositoryOwner: String!, $repositoryName: String!, $issuesFirst: Int) {
  repository(owner: $repositoryOwner, name: $repositoryName) {
    name
    issues(first: $issuesFirst){
      edges {
        node {
          id
          title
        }
      }
    }
  }
}
`;

type FetchData = {
  repository: {
    name: string;
    issues: {
      edges: {
        node: {
          id: string;
          title: string;
        };
      }[];
    };
  };
};

function getIssues() {
  const client = new GraphQLClient(API, {
    headers: {
      Authorization:
        "bearer " + process.env.NEXT_PUBLIC_GITHUB_PERSONAL_ACCESSTOKEN,
    },
  });

  const { data, error } = useSWR<FetchData>(query, (query) =>
    client.request(query, {
      repositoryOwner: repositoryOwner,
      repositoryName: repositoryName,
      issuesFirst: issuesFirst,
    })
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return data.repository.issues.edges.map((issue) => (
    <li key={issue.node.id}>{issue.node.title}</li>
  ));
}

const IssuesPage = () => (
  <>
    <h1>
      {repositoryOwner}/{repositoryName} Issue List
    </h1>
    {getIssues()}
  </>
);

export default IssuesPage;
