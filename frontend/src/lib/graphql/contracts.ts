import { gql } from "@apollo/client";

export const CONTRACTS_QUERY = gql`
  query Contracts($clientId: ID) {
    contracts(clientId: $clientId, first: 100) {
      data {
        id
        clientId
        projectId
        title
        hourlyRate
        monthlyRate
        paymentTerms
        startDate
        endDate
        notes
        client {
          id
          name
        }
        project {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export const CREATE_CONTRACT_MUTATION = gql`
  mutation CreateContract($input: CreateContractInput!) {
    createContract(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_CONTRACT_MUTATION = gql`
  mutation UpdateContract($id: ID!, $input: UpdateContractInput!) {
    updateContract(id: $id, input: $input) {
      id
      title
    }
  }
`;

export const DELETE_CONTRACT_MUTATION = gql`
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id) {
      id
    }
  }
`;
