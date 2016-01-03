// Register our ability to handle page requests in the "wiki/" name space
irulan.run(['PageNamespaceProviders', 'WikiPage', function(PageNamespaceProviders, WikiPage) {
  // How can I push the factory?
  PageNamespaceProviders.push({
    namespace: 'wiki/',
    factory: WikiPage
  });
}]);

// Register the markdownRenderer for handling any data marked as "md"
irulan.run(['SourceRenderers', function(PageRenderers) {
  PageRenderers.push({
    sourceFormat: 'md',
    name: 'markdownRenderer'
  });
}]);


// This filter takes a "page" object and runs it through the appropraite
//  functions to convert it from Markdown to HTML
irulan.filter('markdownRenderer', function() {
  return function(page) {
    var renderer = new marked.Renderer();
    var lexer = new marked.Lexer({});
    //console.log(lexer.rules);
    //console.log(renderer)
    renderer.link = function(href, title, text) {
      if (title == null) {
        title = page.name;
      }
      if (/:\/\//.test(href)) {
        console.log("absolute uri: " + href);
      }
      else if (/^\/\//.test(href)) {
        console.log("absolute uri (relative protocol): " + href);
      }
      else if (/^\//.test(href)) {
        console.log("relative uri (to site base): " + href);
      }
      else {
        console.log("relative uri: " + href);
        var base = page.name.split("/", 2)[0];
        //var relativeName = page.name.split(":", 2)[1];
        href = "/" + base + "/" + href
        console.log(href);
      }
      return '<a href="'+ href + '" title="' + title + '">' + text + '</a>';
    }
    var context = [];
    context.titleExtracted = false;
    context.page = page;
    renderer.heading = (function(string, level) {
      if ((level < 3) && (!context.titleExtracted)) {
        context.page.title = string;
        context.titleExtracted = true;
        return "";
      }
      else {
        level = level + 2;
        return '<h' + level + '>' + string + '</h' + level + '>';
      }
    }).bind(context);

    return marked(page.content, {renderer: renderer});
  }
});

irulan.factory('WikiPage', ['Page', '$resource', function(Page, $resource) {
  function WikiPage() {
    //What here?
  }
  //var wikipage = new Page;
  //wikipage.name = '';
  //wikipage.sourceFormat = 'txt';
  //wikipage.returnedJson = '';
  //wikipage.content = '';

  WikiPage.resource = $resource('/pages/wiki/:name');
  WikiPage.get = function(options, callback) {
    // We need this information to be available to the callback function so we
    //  create a "context" object which will become the "this" object within
    //  the callback function.
    var context = [];
    context.options = options;
    context.thisWikiPage = new WikiPage;
    context.thisWikiPage.name = options.name
    context.callback = callback;
    context.wikipages = this.wikipages;

    // We need to remove the "wiki:" from the start of the requested page
    //  name.
    options.name = options.name.replace(/^wiki\//i, "");
    console.log("will request: " + options.name);

    // Make the http call
    this.resource.get(options, (function(value) {
      console.log(value);
      thisWikiPage = this.thisWikiPage;
      //thisWikiPage.name = this.options.name;
      thisWikiPage.content = value.content;
      thisWikiPage.sourceFormat = value.sourceFormat;
      thisWikiPage.returnedJson = value;
      context.callback(thisWikiPage);
    }).bind(context), (function(res){
      console.log("everything went to hell");
      console.log(res);
    }));
    return context.thisWikiPage
  }

  return WikiPage;
}]);
