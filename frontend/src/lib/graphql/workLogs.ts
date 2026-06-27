import { gql } from "@apollo/client";

export const WORK_LOGS_QUERY = gql`
  query WorkLogs($projectId: ID) {
    workLogs(projectId: $projectId, first: 100) {
      data {
        id
        projectId
        workedDate
        hours
        description
        hourlyRate
        project {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export const CREATE_WORK_LOG_MUTATION = gql`
  mutation CreateWorkLog($input: CreateWorkLogInput!) {
    createWorkLog(input: $input) {
      id
      workedDate
      hours
    }
  }
`;

export const UPDATE_WORK_LOG_MUTATION = gql`
  mutation UpdateWorkLog($id: ID!, $input: UpdateWorkLogInput!) {
    updateWorkLog(id: $id, input: $input) {
      id
      workedDate
      hours
    }
  }
`;

export const DELETE_WORK_LOG_MUTATION = gql`
  mutation DeleteWorkLog($id: ID!) {
    deleteWorkLog(id: $id) {
      id
    }
  }
`;
