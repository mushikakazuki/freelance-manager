import { gql } from "@apollo/client";

export const PROJECTS_QUERY = gql`
  query Projects($clientId: ID) {
    projects(clientId: $clientId, first: 100) {
      data {
        id
        clientId
        name
        description
        status
        startDate
        endDate
        hourlyRate
        client {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      clientId
      name
      description
      status
      startDate
      endDate
      hourlyRate
      client {
        id
        name
      }
      invoices {
        id
        invoiceNumber
        status
        totalAmount
        issuedAt
        dueAt
      }
      workLogs {
        id
        workedDate
        hours
        description
        hourlyRate
      }
      expenses {
        id
        category
        description
        amount
        incurredAt
      }
      tasks {
        id
        title
        status
        priority
        dueDate
      }
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      status
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      status
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;
