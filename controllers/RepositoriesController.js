const axios = require('axios');
const GithubGraphQLApi = require('node-github-graphql');
const github = new GithubGraphQLApi({
  token: process.env.GITHUB_ACCESS_TOKEN,
});

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

const Index = async (_, res) => {
  await fetch(res);
};

async function fetch(fn, array = [], start = 10, after = null, login = "thoughtworks"){
  github.query(query, { start: start, after: after, login: login }, async (req, res) => {
    const repositories = req.data.organization.repositories;
    for(let element of repositories.edges) {
      const host = "https://api.github.com/repos";
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const url = `${ host }${ element.node.resourcePath }/contributors?client_id=${ clientId }&client_secret=${ clientSecret }`;
      const collaborators = await fetchCollaborators(url);
      element.collaborators = collaborators;
    }
    array = array.concat(repositories.edges);

    if(repositories.pageInfo.hasNextPage) {
      const endCursor = repositories.pageInfo.endCursor;
      fetch(fn, array, start, endCursor, login);
    } else {
      fn.json(array);
    }
  });
};

function collaborators(element) {
  const host = "https://api.github.com/repos";
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const url = `${ host }${ element.node.resourcePath }/contributors?client_id=${ clientId }&client_secret=${ clientSecret }`;
  collaborators = fetchCollaborators(url);
  element.collaborators = collaborators;
  return element;
}

async function fetchCollaborators(url, collaborators = []) {
  try {
    const response = await axios.get(url);
    collaborators = collaborators.concat(response.data);
    const link = response.headers.link;
    // TODO alterar esse método horrível
    if(link && link.split(",")[0].match("next")) {
      const nextPageUrl = link.split(",")[0].split(";")[0].replace(/>/g, '').replace(/</g, '');
      return fetchCollaborators(nextPageUrl, collaborators);
    }
    return collaborators;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { Index };