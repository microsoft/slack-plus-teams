/**
 * Markdown format conversion between Slack mrkdwn and standard Markdown.
 *
 * Slack mrkdwn:     *bold*  ~strike~  _italic_  <url|label>
 * Std Markdown:     **bold** ~~strike~~ _italic_ [label](url)
 */

/** Convert Slack mrkdwn to standard Markdown (for Adaptive Cards). */
export function mrkdwnToMarkdown(text: string): string {
  return text
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "**$1**")  // *bold* → **bold**
    .replace(/~([^~]+)~/g, "~~$1~~")                  // ~strike~ → ~~strike~~
    .replace(/<([^|>]+)\|([^>]+)>/g, "[$2]($1)");     // <url|label> → [label](url)
}

/** Convert standard Markdown to Slack mrkdwn (for Block Kit). */
export function markdownToMrkdwn(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "*$1*")              // **bold** → *bold*
    .replace(/~~([^~]+)~~/g, "~$1~")                  // ~~strike~~ → ~strike~
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<$2|$1>");  // [label](url) → <url|label>
}
