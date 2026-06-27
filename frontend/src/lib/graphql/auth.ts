import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    register(
      input: {
        name: $name
        email: $email
        password: $password
        passwordConfirmation: $passwordConfirmation
      }
    ) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;
