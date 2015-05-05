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
  return { 'sections': sections }
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
    output.comment = markdown(content.split(/```/)[0])
    output.result  = content.split(/```/)[1]
    output.markup  = '<pre class="hljs"><code>'+highlight.highlight('html', content.split(/```/)[1].split(/```/)[0].trim()).value+'</code></pre>'
    // Render styles only if they were present
    if (unspace(styling).length > 0) {
      output.style  = '<pre class="hljs"><code>'+highlight.highlight('scss', styling.trim()).value+'</code></pre>'
    }
  } else {
    // No code example, so just the comment
    output.comment = markdown(content)
  }
  // Return
  return output
}
