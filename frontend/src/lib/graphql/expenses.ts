import { gql } from "@apollo/client";

export const EXPENSES_QUERY = gql`
  query Expenses($projectId: ID) {
    expenses(projectId: $projectId, first: 100) {
      data {
        id
        projectId
        category
        description
        amount
        incurredAt
        receiptUrl
        project {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export const CREATE_EXPENSE_MUTATION = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      category
      amount
    }
  }
`;

export const UPDATE_EXPENSE_MUTATION = gql`
  mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
    updateExpense(id: $id, input: $input) {
      id
      category
      amount
    }
  }
`;

export const DELETE_EXPENSE_MUTATION = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id) {
      id
    }
  }
`;
