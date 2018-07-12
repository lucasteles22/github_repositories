const GithubGraphQLApi = require('node-github-graphql');
const github = new GithubGraphQLApi({ token: process.env.GITHUB_ACCESS_TOKEN });
const githubRestCollaboratorApi = require("../../rest/collaborator/api");

const githubHost = "https://api.github.com/repos";
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const query = `
query($start: Int, $after: String, $login: String = ""){
  organization(login: $login){
    repositories(first: $start, after: $after){
      pageInfo{
        hasNextPage,
        endCursor,
      },
      edges{
        node{
          stargazers{
            totalCount,
          },
          primaryLanguage{
            name,
          },
          name,
          url,
          forkCount,
          resourcePath,
        }
      }
    }
  }
}
`;

async function Fetch(fn, array = [], start = 100, after = null, login = "thoughtworks"){
  github.query(query, { start: start, after: after, login: login }, async (req, res) => {
    const repositories = req.data.organization.repositories;
    for(let element of repositories.edges) {
      const url = `${ githubHost }${ element.node.resourcePath }/contributors?client_id=${ githubClientId }&client_secret=${ githubClientSecret }`;
      const collaborators = await githubRestCollaboratorApi.Fetch(url);
      element.collaborators = collaborators;
    }
    array = array.concat(repositories.edges);

    if(repositories.pageInfo.hasNextPage) {
      const endCursor = repositories.pageInfo.endCursor;
      Fetch(fn, array, start, endCursor, login);
    } else {
      fn.json(array);
    }
  });
};

module.exports = { Fetch };