import { gql } from "@apollo/client";

export const TASKS_QUERY = gql`
  query Tasks($projectId: ID) {
    tasks(projectId: $projectId, first: 100) {
      data {
        id
        projectId
        title
        description
        status
        priority
        dueDate
        completedAt
        sortOrder
        project {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      status
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;
