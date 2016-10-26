$title "Markup Tester"
$desc "This page is designed to test markup"
$categories ["technical", "default"]

# Heading 1
This is a heading
## Heading 2
This is a heading
### Heading 3
This is a heading
#### Heading 4
This is a heading
##### Heading 5
This is a heading
###### Heading 6
This is a heading

# Span Elements

## Links
External Anchor: [click me!](https://vevox.io)

Internal Anchor: [click me!](/special/random)

Internal Hash: [click me!](#heading-1)

## Emphasis
Bold with **two asterisks**.

Bold with __two underscores__.

Italics with *asterisks*.

Italics with _underscores_.

Literal \*asterisks\*.

## Code
Inline `code snippet`.

Code ``with a backtick (`) included ``

## Images
![Logo Image](/img/logo.png)

# Block Elements

Headers were skipped here because of their inclusion at the top of the page.

## Blockquotes

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.

### Nested Blockquotes
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

### Marked Blockquotes

> ## This is a header
>
> 1.   This is the first list item.
> 2.   This is the second list item.
>
> Here's some example code:
>
>     return shell_exec("echo $input | $markdown_script");

## Lists

* List Item 1
* List Item 2
* Etc.

### Ordered Lists

1. List Item 1
2. List Item 2
3. Etc.

## Code Blocks
This is a normal paragraph

    This is a code block.

## Horizontal Rules

---
