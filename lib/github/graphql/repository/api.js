const GithubGraphQLApi = require('node-github-graphql');
const githubRestCollaboratorApi = require("../../rest/collaborator/api");
const query = require("../query");

const github = new GithubGraphQLApi({
  token: process.env.GITHUB_ACCESS_TOKEN,
  Promise: require('bluebird'),
});

const githubHost = "https://api.github.com/repos";
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

async function fetch(array = [], start = 10, after = null, login = "thoughtworks"){
  const response = await github.query(query.repository, { start: start, after: after, login: login });
  const repositories = response.data.organization.repositories;
  for(let element of repositories.edges) {
    const url = `${ githubHost }${ element.node.resourcePath }/contributors?client_id=${ githubClientId }&client_secret=${ githubClientSecret }`;
    const collaborators = await githubRestCollaboratorApi.fetch(url);
    element.node.collaborators = collaborators || [];
  }
  array = array.concat(repositories.edges);

  if(repositories.pageInfo.hasNextPage) {
    const endCursor = repositories.pageInfo.endCursor;
    return fetch(array, start, endCursor, login);
  } else {
    return array;
  }
};

module.exports = { fetch };