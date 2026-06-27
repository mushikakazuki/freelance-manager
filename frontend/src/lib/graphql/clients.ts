import { gql } from "@apollo/client";

export const CLIENTS_QUERY = gql`
  query Clients {
    clients(first: 100) {
      data {
        id
        name
        email
        phone
        address
        notes
        createdAt
      }
    }
  }
`;

export const CLIENT_QUERY = gql`
  query Client($id: ID!) {
    client(id: $id) {
      id
      name
      email
      phone
      address
      notes
      createdAt
      projects {
        id
        name
        status
        startDate
        endDate
      }
      contracts {
        id
        title
        startDate
        endDate
      }
    }
  }
`;

export const CREATE_CLIENT_MUTATION = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      id
      name
      email
      phone
      address
      notes
    }
  }
`;

export const UPDATE_CLIENT_MUTATION = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      name
      email
      phone
      address
      notes
    }
  }
`;

export const DELETE_CLIENT_MUTATION = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id) {
      id
    }
  }
`;
