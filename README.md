# sson

> `sson` is a node module for parsing stylesheet markdown comments into semantic JSON

## Install

Install with `npm install sson --save`.

## Getting started

Call `sson` with a content buffer from CSS, SCSS, LESS (or similar file formats) and it will return a JSON object containing `sections`, one for each block comment in the source file.

Comments will be parsed as [Markdown](https://github.com/chjj/marked) and any recognised  code blocks will be rendered as HTML/CSS source-result pairs, with added syntax [highlighting](https://github.com/isagalaev/highlight.js).

### Example source file

```
/*

# Foo

Renders paragraphs as bold text.

    <p>Hello World</p>

*/

p {
  font-weight: bold;
}
```

### Example usage

```js
var sson = require('sson')
var data = fs.readFileSync('foo.css')

sson(data)
```

### Example output

```json
{
  "sections": [
    {
      "comment": "<h1 id="foo">Foo</h1>\n<p>Renders paragraphs as bold text.</p>\n",
      "result": "\n<p>Hello World</p>\n",
      "markup": "<pre class="hljs"><code><span class="hljs-tag">&lt;<span class="hljs-title">p</span>&gt;</span>Hello World<span class="hljs-tag">&lt;/<span class="hljs-title">p</span>&gt;</span></code></pre>",
      "style": "<pre class="hljs"><code><span class="hljs-tag">p</span> {\n  <span class="hljs-attribute">font-weight</span><span class="hljs-value">: bold;</span>\n}</code></pre>"
    }
  ]
}
```

## Notes

Please note that `sson` does not compile any preprocessor source files, merely parses the comments. It works well with [Sassdown](https://github.com/nopr/sassdown) to produce living styleguides.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-new-feature`)
5. Create new Pull Request

## History
View the [change log](CHANGELOG.md).
