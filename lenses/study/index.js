'use strict'

const path = require('path')
const fs = require('fs')
const util = require('util')
const writeFilePromise = util.promisify(fs.writeFile)

const terser = require('terser')

const detectType = require('./lib/detect-type.js')

const renderDependencies = require('./lib/render-dependencies.js')

const liveStudyLense = async ({ config, resource, responseData, requestData }) => {

  if (requestData.method === 'POST') {
    console.log('-- POST')
    try {
      const absolutePath = path.join(resource.info.root, resource.info.dir, resource.info.base)
      await writeFilePromise(absolutePath, requestData.body.text, 'utf-8');
      resource.content = 'changes were saved'
      resource.info.ext = '.txt'
      return {
        resource
      }
    } catch (err) {
      console.log(err);
      responseData.status = 500
      resource.content = 'unable to save changes.  check server logs for more info'
      resource.info.ext = '.txt'
      return {
        resource,
        responseData
      }
    }
  }

  if (resource.content === null || resource.info === null || resource.error) {
    return
  }

  const type = detectType(resource)


  let typeView = () => { }
  try {
    typeView = new (require(`./views/${type}.js`))({ resource, config })
  } catch (o_0) {
    typeView = new (require(`./views/code.js`))({ resource, config })
  }

  // // doing this in the ?hyf by adding the ?min lense before study
  // //   a more lensy way to do it
  // //   and then students can still study the solution normally
  // if (resource.info && resource.info.ext === '.js'
  //   && resource.info && typeof resource.info.base == 'string'
  //   && resource.info.base.toLowerCase().match('.re.')) {
  //   try {
  //     config.content = (await terser.minify(resource.content, {
  //       compress: true
  //     })).code
  //   } catch (err) {
  //     console.log(err)
  //     config.content = resource.content
  //   }
  // } else {
  config.content = resource.content
  // }
  config.ext = resource.info.ext

  if (typeof config.readOnly !== 'boolean') {
    config.readOnly = false
  }

  config.locals = Object.assign({}, config.locals, config.queryValue)

  resource.info.ext = '.html'
  resource.content = `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title id='title'>${resource.info.dir}/${resource.info.base}</title>
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">

  ${typeView.styles()}

  ${typeView.scriptsHead()}

  ${renderDependencies(config.dependencies, resource)}
  ${config.locals.tests ? `
    <script src='${config.ownStatic}/dependencies/describe-it.js'></script>
    <script src='${config.ownStatic}/dependencies/chai-and-chai-dom.js'></script>
    ` : ''}

</head>

<body>

  <section>
    <div class="dropdown">
      <code>&#187; options &#171;</code>
      <div class='dropdown-content'>
        <a href='?--help' target='_blank'><code>--help</code>!  what is this?</a>
        ${typeView.configOptions()}
      </div>
    </div>
    ${typeView.panel()}
  </section>
  <main>
    ${typeView.code()}
  </main>

  ${typeView.configScript()}

  ${typeView.scriptsBody()}

  <script type='module' src='${config.ownStatic}/types/${type}/init.js'></script>

</body>

</html>
`


  return {
    resource
  }


}

module.exports = liveStudyLense
