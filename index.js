// Requirements
var fs = require('fs'),
    markdown = require('marked'),
    highlight = require('highlight.js')

var source;

/**
 * Returns a JSON object of formatted stylesheet comment data
 * @param {Buffer} buffer
 * @returns {JSON}
 */
module.exports = function (buffer) {
  // Make available
  source = buffer.toString()
  // Create formatted array for matching sections
  var sections = matching().map(function (comment) {
    return formatting(comment)
  })
  // Return as JSON sections list
  return {
    'sections': sections
  }
}

// Return one or more regular expression matches
// for text within CSS block comments
function matching() {
  var expression = new RegExp(/\/\*/.source + '([\\s\\S]*?)' + /\*\//.source, 'g')
  return source.match(expression)
}

// Returns a string with returns, linebreaks
// and character spaces removed
function unspace(string) {
  return string.replace(/\r\n|\n| /g, '')
}

// Normalises any indentation and commenting style
// structure into a consistent format for parsing
function normalise(comment) {
  comment = comment.replace(/\/\*/, '')
  comment = comment.replace(/\*\//, '')
  comment = comment.trim().replace(/^\*/, '').replace(/\n \* |\n \*|\n /g, '\n').replace(/\n   /g, '\n    ')
  if (!comment.match('```') && comment.match('    ')) {
    comment = comment.replace(/    |```\n    /, '```\n    ')
    comment = comment.replace(/\n    /g, '\n').replace(/\n /g, '\n')
    comment += '\n```'
  }
  return comment
}

// Formats a stylesheet markdowncomment block into an Object
// and returns the properties: comment, result, markup and style
function formatting(comment) {
  // Object for output
  var output = {}
  // Normalise the content and abstract styling
  var content = normalise(comment)
  var styling = source.split(comment)[1].split(/\/\*/)[0]
  // If the comment contains any code braces
  if (content.match(/```/)) {
    // Break down the content into blocks by type
    output.comment = markdown(content)
    var pre = new RegExp(/(?:```)([\s\S]*?)(?:```)/g)
    var examples = pre.exec(content)
    // Create results content
    output.result = ''
    // Loop
    while (examples != null) {
      var parsed = markdown('```'+examples[1]+'```')
      var highlighted = '<pre class="hljs"><code>'+highlight.highlight('html', examples[1].trim()).value+'</code></pre>'
      output.comment = output.comment.replace(parsed, highlighted)
      output.result += examples[1]
      // Run the regular expression again
      examples = pre.exec(content)
    }
    // Render styles only if they were present
    if (unspace(styling).length > 0) {
      output.styles  = '<pre class="hljs"><code>'+highlight.highlight('scss', styling.trim()).value+'</code></pre>'
    }
  } else {
    // No code example, so just the comment
    output.comment = markdown(content)
  }
  // Determine whether file contains @import statements
  if (styling.match(/@import/)) {
    // Find any relevant matches
    var matches = new RegExp(/@import\s(?:'|")(.+)(?:'|");/g)
    var imports = matches.exec(styling)
    // Create array for partial imports
    output.imports = {}
    // Loop through each import
    while (imports != null) {
      // Get path and filename from string
      var item = imports[1].split('/')
      if (item.length) {
        var filename = item[item.length-1]
        var filepath = imports[1].replace('/'+filename, '')
        // Add to imports array
        output.imports[filepath] = output.imports[filepath] || []
        output.imports[filepath].push(filename)
        // // Run the regular expression again
        imports = matches.exec(styling)
      }
    }
  }
  // Return
  return output
}
