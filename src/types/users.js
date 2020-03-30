export default `
    scalar Upload
    
    type Error{
        path: String!
        message: String!
    }

    type User{
        _id: ID
        password: String!
        fullname: String
        email: String!
        thumbnail: String
    }
    type Query{
        allUsers: [User]!
        getUser(_id: ID): User!
        me: User!
    }

    type Response {
        success: Boolean!
        token: String
        errors: [Error]
    }
    
    input Facebook {
        id: String!
        displayName: String!
        email: [Email]
    }
    
    input Google {
        id: String!
        displayName: String!
        email: [Email]
    }

    input Email {
        value: String
    }

    type File {
        id: ID!
        path: String!
        filename: String!
        mimetype: String!
        encoding: String!
    }

    type Mutation{
        login(email: String!, password: String!): Response!
        #Type = 'user|employed|company'
        loginf(facebook:Facebook, type: String!): Response!
        #Type = 'user|employed|company'
        loging(google:Google, type: String!): Response!
        createUser(password: String!, fullname: String!, email: String!, type: String!): Response!
        singleUpload ( file: Upload!): File!
    }
`;