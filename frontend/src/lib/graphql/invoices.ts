import { gql } from "@apollo/client";

export const INVOICES_QUERY = gql`
  query Invoices($projectId: ID) {
    invoices(projectId: $projectId, first: 100) {
      data {
        id
        projectId
        invoiceNumber
        status
        amount
        taxRate
        taxAmount
        totalAmount
        issuedAt
        dueAt
        paidAt
        notes
        project {
          id
          name
          client {
            id
            name
          }
        }
        createdAt
      }
    }
  }
`;

export const INVOICE_QUERY = gql`
  query Invoice($id: ID!) {
    invoice(id: $id) {
      id
      projectId
      invoiceNumber
      status
      amount
      taxRate
      taxAmount
      totalAmount
      issuedAt
      dueAt
      paidAt
      notes
      project {
        id
        name
        client {
          id
          name
        }
      }
      invoiceItems {
        id
        description
        quantity
        unitPrice
        amount
        sortOrder
      }
    }
  }
`;

export const CREATE_INVOICE_MUTATION = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      id
      invoiceNumber
      status
      totalAmount
    }
  }
`;

export const UPDATE_INVOICE_MUTATION = gql`
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      id
      invoiceNumber
      status
      totalAmount
    }
  }
`;

export const DELETE_INVOICE_MUTATION = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id) {
      id
    }
  }
`;
