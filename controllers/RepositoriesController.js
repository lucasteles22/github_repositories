const githubGraphQLCollaboratorApi = require("../lib/github/graphql/repository/api");
const Index = async (_, res) => {
  const repositories = await githubGraphQLCollaboratorApi.Fetch();
  res.json({ repositories });
};

module.exports = { Index };