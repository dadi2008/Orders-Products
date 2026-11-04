export const ordersQuery = `
  query Orders($search: String) {
    orders(search: $search) {
      id
      title
      description
      createdAt
      productCount
      totals {
        currency
        value
      }
      products {
        id
        serialNumber
        title
        type
        specification
        photoUrl
        condition
        status
        guaranteeStart
        guaranteeEnd
        receivedAt
        orderId
        order {
          id
          title
        }
        prices {
          value
          currency
          isDefault
        }
      }
    }
  }
`;

export const productsQuery = `
  query Products($type: String, $search: String) {
    products(type: $type, search: $search) {
      id
      serialNumber
      title
      type
      specification
      photoUrl
      condition
      status
      guaranteeStart
      guaranteeEnd
      receivedAt
      orderId
      order {
        id
        title
      }
      prices {
        value
        currency
        isDefault
      }
    }
  }
`;

export const productTypesQuery = `
  query ProductTypes {
    productTypes
  }
`;

export const createOrderMutation = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      title
      description
      createdAt
      productCount
      totals {
        currency
        value
      }
      products {
        id
        serialNumber
        title
        type
        specification
        photoUrl
        condition
        status
        guaranteeStart
        guaranteeEnd
        receivedAt
        orderId
        order {
          id
          title
        }
        prices {
          value
          currency
          isDefault
        }
      }
    }
  }
`;

export const createProductMutation = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      serialNumber
      title
      type
      specification
      photoUrl
      condition
      status
      guaranteeStart
      guaranteeEnd
      receivedAt
      orderId
      order {
        id
        title
      }
      prices {
        value
        currency
        isDefault
      }
    }
  }
`;

export const deleteOrderMutation = `
  mutation DeleteOrder($id: Int!) {
    deleteOrder(id: $id)
  }
`;

export const deleteProductMutation = `
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

export const usersQuery = `query Users($page: Int!, $pageSize: Int!, $search: String) { users(page: $page, pageSize: $pageSize, search: $search) { items { id name email avatarUrl createdAt } total page pageSize } }`;
export const currentUserQuery = `query CurrentUser { currentUser { id name email avatarUrl createdAt } }`;
export const updateCurrentUserMutation = `mutation UpdateCurrentUser($input: UpdateCurrentUserInput!) { updateCurrentUser(input: $input) { id name email avatarUrl createdAt } }`;

export const loginMutation = `mutation Login($input: LoginInput!) { login(input: $input) { accessToken refreshToken user { id name email avatarUrl createdAt } } }`;
export const registerMutation = `mutation Register($input: RegisterInput!) { register(input: $input) { accessToken refreshToken user { id name email avatarUrl createdAt } } }`;
export const refreshSessionMutation = `mutation RefreshSession($input: RefreshTokenInput!) { refreshSession(input: $input) { accessToken refreshToken user { id name email avatarUrl createdAt } } }`;
export const logoutMutation = `mutation Logout { logout }`;
