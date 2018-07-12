const githubGraphQLCollaboratorApi = require("../lib/github/graphql/repository/api");
const Index = async (_, res) => {
  await githubGraphQLCollaboratorApi.Fetch(res);
};

module.exports = { Index };