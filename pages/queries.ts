import { gql } from "graphql-request";

/**
 * ViewerのIDを取得するクエリ
 */
export const getViewerQuery = gql`
  query GetViewer {
    viewer {
      id
    }
  }
`;

/**
 * 指定したリポジトリ/Issue/リアクションの一覧を取得するクエリ
 */
export const getIssueReactionsQuery = gql`
  query GetIssueReactions(
    $repositoryOwner: String!
    $repositoryName: String!
    $issueNumber: Int!
    $reactionsContent: ReactionContent
    $reactionsLast: Int
  ) {
    repository(owner: $repositoryOwner, name: $repositoryName) {
      issue(number: $issueNumber) {
        reactions(content: $reactionsContent, last: $reactionsLast) {
          edges {
            node {
              createdAt
              content
              user {
                id
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Issueにリアクションを追加するクエリ
 */
export const addReactionQuery = gql`
  mutation AddReaction($addReactionInput: AddReactionInput!) {
    addReaction(input: $addReactionInput) {
      reaction {
        content
      }
      subject {
        id
      }
    }
  }
`;

/**
 * Issueからリアクションを削除するクエリ
 */
export const removeReactionQuery = gql`
  mutation RemoveReaction($removeReactionInput: RemoveReactionInput!) {
    removeReaction(input: $removeReactionInput) {
      reaction {
        content
      }
      subject {
        id
      }
    }
  }
`;
