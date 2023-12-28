const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType
} = require('graphql')

// Mongoose Model
const Project = require('../models/projectsModel')
const Client = require('../models/clientModel')

// Client Type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
})

// Project Type
const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parents, args) {
                return Client.findById(parents.clientId)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        // LIST ALL PROJECTS
        projects: {
            type: new GraphQLList(ProjectType),
            resolve(parents, args) {
                return Project.find()
            }
        },

        // READ SINGLE PROJECT
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID } },
            resolve(parents, args) {
                return Project.findById(args.id)
            }
        },

        // LIST ALL CLIENTS
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parents, args) {
                return Client.find()
            }
        },

        // READ SINGLE CLIENT
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID } },
            resolve(parents, args) {
                return Client.findById(args.id)
            }
        }
    }
})

// Mutation

const myMutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        // ADD A CLIENT
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone
                })

                return client.save()
            }
        },

        // DELETE A CLIENT
        deleteClient: {
            type: ClientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                await Project.deleteMany({ clientId: args.id });
                return Client.findByIdAndDelete(args.id);
            }
        },

        // ADD A PROJECT
        addProject: {
            type: ProjectType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatus',
                        values: {
                            'new': { value: 'Not Started' },
                            'progress': { value: 'In Progress' },
                            'completed': { value: 'Completed' },
                        }
                    }),
                    defaultValue: 'Not Started'
                },
                clientId: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                })

                return project.save()
            }
        },

        // DELETE A PROJECT
        deleteProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                return Project.findByIdAndDelete(args.id)
            }
        },

        // UPDATE A PROJECT
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values: {
                            'new': { value: 'Not Started' },
                            'progress': { value: 'In Progress' },
                            'completed': { value: 'Completed' },
                        }
                    })
                },
                clientId: { type: GraphQLID },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(
                    args.id, {
                    $set: {
                        name: args.name,
                        description: args.description,
                        status: args.status,
                        clientId: args.clientId
                    }
                }, { new: true })

            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: myMutation
})