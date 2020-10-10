const path = require('path');
const marked = require('marked');

const renderLense = async (simpReq, resource, config) => {
  const { absPath } = resource;

  if (path.extname(absPath) !== '.md') {
    return resource;
  }

  try {
    resource.content = marked(resource.content);
    resource.mime = 'text/html';
    resource.absPath = resource.absPath.replace('.md', '.html')
    resource.relPath = resource.relPath.replace('.md', '.html')
  } catch (err) {
    console.log(err);
  }

  return resource;
};

module.exports = renderLense;
