# Welcome

This is the home page.  There's not much to see here yet.

The source of this welcome message is composed in markdown, a format that makes
content composition simple and efficient while still allowing the formatting you
would expect.

At the server the page is stored as a simple text file on the file system(no
SQL/NoSQL backend).

What, I hope, sets this wiki apart from most others is that it is the client
(browser) that renders the markdown document into html which shifts some of the
burden away from the server and reduces the amount of traffic transferred
between client and server.  It also means that the server doesn't need to know
anything about the client.  The server provides the raw content, the client
decides how it should be rendered (maybe taking end user preferences and
accessibility into account).

### Some markdown formatted elements

This will be an [internal link](page2)

```
this will be a code block
```

```js
this.would(be, javascript).highlighted('if I had syntax highlighting implemented');
```

<warning>This warning text will be rendered as a colorful box to draw the user's
attention, when I get that feature implemented.</warning>

Some text examples of simple markdown formatted text
* normal
*  **bold**
*  *italics*
*  ***bold italics***
