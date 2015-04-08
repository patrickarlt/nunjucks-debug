var nunjucks = require('nunjucks');
var hljs = require('highlight.js');

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));

var hljs = require('highlight.js');

function Highlight() {
  this.tags = ['highlight'];

  this.parse = function(parser, nodes, lexer) {
    // get the tag token
    var token = parser.nextToken();

    // parse the args and move after the block end. passing true
    // as the second arg is required if there are no parentheses
    var args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(token.value);

    // parse the body and possibly the error block, which is optional
    var body = parser.parseUntilBlocks('endhighlight');

    parser.advanceAfterBlockEnd();

    // See above for notes about CallExtension
    return new nodes.CallExtension(this, 'run', args, [body]);
  };

  this.run = function(context, lang, body) {
    if(!body){
      body = lang;
      lang = 'auto';
    }
    var code = body();
    var highlighted = (lang === 'auto') ? hljs.highlightAuto(code) : hljs.highlight(lang, code);

    return '<pre><code class="hljs ' + highlighted.language + '">' + highlighted.value.trim() + '</code></pre>';
  };
}

env.addExtension('highlight', new Highlight());

function Metadata() {
  this.tags = ['meta'];

  this.parse = function(parser, nodes, lexer) {
    // get the tag token
    var token = parser.nextToken();
    var nextToken = parser.peekToken();

    // the next token is the end of the block so no args
    if(nextToken.type === 'block-end'){
      // tried various things, in various orders...
      // parser.skip('meta');
      // parser.skip(lexer.TOKEN_BLOCK_END);
      // parser.advanceAfterBlockEnd(token.value);
      return new nodes.CallExtension(this, 'run');
    } else {
      var args = parser.parseSignature(null, true);
      parser.advanceAfterBlockEnd(token.value);
      return new nodes.CallExtension(this, 'run', args);
    }
  };

  this.run = function(context, title, desc){
    var t = '<title>' + (title || context.ctx.title) +'</title>';
    var d = '<meta name="description" content="'+ (desc || context.ctx.description) +'">';
    return [t, d].join('\n');
  };
}

env.addExtension('meta', new Metadata());

console.log(env.render('highlight-params.html', {}));

console.log(env.render('highlight-no-params.html', {}));

console.log(env.render('meta-params.html', {
  title: 'Foo',
  description: 'Bar'
}));

console.log(env.render('meta-no-params.html', {
  title: 'Foo',
  description: 'Bar'
}));