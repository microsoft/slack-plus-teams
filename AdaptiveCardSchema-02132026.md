## Elements

AdaptiveCard: Root card object containing body, actions, metadata, and configuration
- $schema, version, fallbackText, speak, refresh, authentication, msteams, msTeams, metadata, resources, references, body, actions, key, type, id, requires, lang, isSortKey, selectAction, style, layouts, minHeight, backgroundImage, verticalContentAlignment, rtl

Container: Grouping element that holds a collection of elements
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, selectAction, style, showBorder, roundedCorners, layouts, bleed, minHeight, backgroundImage, verticalContentAlignment, rtl, maxHeight, grid.area, fallback, items

ColumnSet: Horizontal arrangement of columns
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, selectAction, style, showBorder, roundedCorners, bleed, minHeight, minWidth, grid.area, fallback, columns

Column: Single column within a ColumnSet
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, selectAction, style, showBorder, roundedCorners, layouts, bleed, minHeight, backgroundImage, verticalContentAlignment, rtl, maxHeight, width, grid.area, fallback, items

Table: Tabular layout with rows, columns, and cells
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, style, showBorder, roundedCorners, columns, minWidth, firstRowAsHeaders, showGridLines, gridStyle, horizontalCellContentAlignment, verticalCellContentAlignment, grid.area, fallback, rows

TableRow: Row within a Table
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, showBorder, roundedCorners, style, horizontalCellContentAlignment, verticalCellContentAlignment, grid.area, fallback, cells

TableCell: Cell within a TableRow acting as a container
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, selectAction, style, layouts, bleed, minHeight, backgroundImage, verticalContentAlignment, rtl, maxHeight, grid.area, fallback, items

ColumnDefinition: Defines width and alignment for a Table column
- key, horizontalCellContentAlignment, verticalCellContentAlignment, width

TextBlock: Displays text with markdown, configurable size/weight/color/wrapping
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, text, text.dynamic, size, weight, color, isSubtle, fontType, wrap, maxLines, style, labelFor, grid.area, fallback

Image: Displays an image from URL or Base64 data URI
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, horizontalAlignment, spacing, targetWidth, isSortKey, url, altText, backgroundColor, style, size, width, height, selectAction, allowExpand, msteams, msTeams, themedUrls, fitMode, horizontalContentAlignment, verticalContentAlignment, grid.area, fallback

ImageSet: Collection of images displayed at uniform size
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, images, imageSize, grid.area, fallback

Media: Displays audio/video content with poster and captions
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, sources, captionSources, poster, altText, grid.area, fallback

RichTextBlock: Rich inline text composed of TextRun, IconRun, ImageRun, CitationRun
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, labelFor, grid.area, fallback, inlines

FactSet: Series of key-value pairs
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, facts, grid.area, fallback

Fact: Single key-value pair within a FactSet
- key, title, value

Icon: Displays an icon from the Adaptive Card icon catalog
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, horizontalAlignment, spacing, targetWidth, isSortKey, name, size, style, color, selectAction, grid.area, fallback

CodeBlock: Syntax-highlighted code snippet
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, codeSnippet, language, startLineNumber, grid.area, fallback

Badge: Small label/tag with optional icon
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, text, icon, iconPosition, appearance, size, shape, style, tooltip, grid.area, fallback

Rating: Read-only star rating display
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, value, count, max, size, color, style, grid.area, fallback

CompoundButton: Button with icon, title, description, and badge
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, icon, badge, title, description, selectAction, grid.area, fallback

LoopComponent: Embeds a Microsoft Loop component via URL
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, componentUrl, grid.area, fallback

ProgressRing: Indeterminate circular progress indicator
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, label, labelPosition, size, grid.area, fallback

ProgressBar: Determinate horizontal progress bar
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, value, max, color, grid.area, fallback

TextRun: Inline text span with formatting options
- key, type, id, lang, isVisible, isVisible.dynamic, isSortKey, text, text.dynamic, size, weight, color, isSubtle, fontType, italic, strikethrough, highlight, underline, selectAction, grid.area, fallback

IconRun: Inline icon within rich text
- key, type, id, lang, isVisible, isVisible.dynamic, isSortKey, name, size, style, color, selectAction, grid.area, fallback

ImageRun: Inline image within rich text
- key, type, id, lang, isVisible, isVisible.dynamic, isSortKey, url, size, style, selectAction, themedUrls, grid.area, fallback

CitationRun: Inline citation reference within rich text
- key, type, id, isVisible.dynamic, text, text.dynamic, referenceIndex, grid.area, fallback

Input.Text: Text input field with validation and style options
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, maxLength, isMultiline, placeholder, style, inlineAction, regex, grid.area, fallback

Input.Date: Date picker input
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, placeholder, min, max, grid.area, fallback

Input.Time: Time picker input
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, placeholder, min, max, grid.area, fallback

Input.Number: Numeric input with min/max constraints
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, placeholder, min, max, grid.area, fallback

Input.Toggle: Toggle/checkbox input with on/off values
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, title, valueOn, valueOff, wrap, showTitle, grid.area, fallback

Input.ChoiceSet: Dropdown, radio button, or checkbox group
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, choices, choices.data, style, isMultiSelect, placeholder, wrap, useMultipleColumns, minColumnWidth, grid.area, fallback

Input.Rating: Interactive star rating input
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, label, isRequired, errorMessage, valueChangedAction, value, max, allowHalfSteps, size, color, grid.area, fallback

Choice: Single choice option within an Input.ChoiceSet
- key, title, value

Data.Query: Dynamic dataset query for Input.ChoiceSet
- key, type, dataset, associatedInputs, count, skip

Chart.Donut: Donut chart with configurable thickness and center value
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, data, value, valueColor, thickness, showOutlines, grid.area, fallback

Chart.Pie: Pie chart
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, data, value, valueColor, thickness, showOutlines, grid.area, fallback

Chart.VerticalBar: Single-series vertical bar chart
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, xAxisTitle, yAxisTitle, data, color, showBarValues, yMin, yMax, grid.area, fallback

Chart.VerticalBar.Grouped: Multi-series grouped or stacked vertical bar chart
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, xAxisTitle, yAxisTitle, color, stacked, data, showBarValues, yMin, yMax, grid.area, fallback

Chart.HorizontalBar: Horizontal bar chart with multiple display modes
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, xAxisTitle, yAxisTitle, color, data, displayMode, grid.area, fallback

Chart.HorizontalBar.Stacked: Stacked horizontal bar chart
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, xAxisTitle, yAxisTitle, color, data, grid.area, fallback

Chart.Line: Line chart supporting time-series and categorical data
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, xAxisTitle, yAxisTitle, color, data, yMin, yMax, grid.area, fallback

Chart.Gauge: Gauge/dial chart with segments and needle
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, title, showTitle, colorSet, maxWidth, showLegend, min, max, subLabel, showMinMax, showNeedle, showOutlines, segments, value, valueFormat, grid.area, fallback

DonutChartData: Data point for donut/pie charts
- key, legend, value, color

VerticalBarChartDataValue: Data point for vertical bar charts
- key, x, y, color

BarChartDataValue: Data point for grouped vertical bar series
- key, x, y

GroupedVerticalBarChartData: Data series for grouped vertical bar charts
- key, legend, values, color

HorizontalBarChartDataValue: Data point for horizontal bar charts
- key, x, y, color

StackedHorizontalBarChartData: Data series for stacked horizontal bar charts
- key, title, data

StackedHorizontalBarChartDataPoint: Data point within a stacked horizontal bar series
- key, legend, value, color

LineChartData: Data series for line charts
- key, legend, values, color

LineChartValue: Data point for line charts
- key, x, y

GaugeChartLegend: Segment definition for gauge charts
- key, size, legend, color

Carousel: Horizontally swipeable set of pages with animation
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, bleed, minHeight, pageAnimation, grid.area, fallback, pages

CarouselPage: Single page within a Carousel
- key, type, id, requires, lang, isVisible, isVisible.dynamic, height, targetWidth, isSortKey, selectAction, style, showBorder, roundedCorners, layouts, minHeight, backgroundImage, verticalContentAlignment, rtl, maxHeight, grid.area, fallback, items

TabSet: Tabbed interface for switching between pages
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, spacing, targetWidth, isSortKey, bleed, minHeight, size, grid.area, fallback, pages

TabPage: Single tab page within a TabSet
- key, type, id, requires, lang, isVisible, isVisible.dynamic, height, targetWidth, isSortKey, selectAction, style, showBorder, roundedCorners, layouts, minHeight, backgroundImage, verticalContentAlignment, rtl, maxHeight, title, tabStyle, iconName, grid.area, fallback, items

Accordion: Collapsible/expandable set of pages
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, targetWidth, isSortKey, minHeight, allowCollapseAllPages, allowMultipleExpandedPages, grid.area, fallback, pages

AccordionPage: Single collapsible page within an Accordion
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, selectAction, style, showBorder, roundedCorners, layouts, bleed, minHeight, backgroundImage, verticalContentAlignment, rtl, maxHeight, headerTitle, headerSize, headerWrap, expandIconPosition, headerIconName, isExpanded, grid.area, fallback, items

ActionSet: Displays a set of actions as buttons
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, grid.area, fallback, actions

Action.Execute: Sends data to a bot (Universal Action model)
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, data, associatedInputs, conditionallyEnabled, verb, fallback

Action.Submit: Sends data to a bot (legacy model)
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, data, associatedInputs, conditionallyEnabled, msteams, msTeams, fallback

Action.OpenUrl: Opens a URL
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, url, fallback

Action.ShowCard: Shows/hides an inline card
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, fallback, card

Action.ToggleVisibility: Toggles visibility of specified elements
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, targetElements, fallback

Action.ResetInputs: Resets specified inputs to default values
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, targetInputIds, fallback

Action.RunCommands: Executes a sequence of commands/expressions
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, menuActions, themedIconUrls, commands, onFailure, fallback

Action.Popover: Displays content in a popover anchored to the action
- key, type, id, requires, title, title.dynamic, iconUrl, style, mode, tooltip, tooltip.dynamic, isEnabled, isEnabled.dynamic, isVisible, isVisible.dynamic, themedIconUrls, content, displayArrow, position, maxPopoverWidth, popoverTitle, fallback

Component.graph.microsoft.com_user: Displays a persona (user) component
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, name, properties, grid.area, fallback

Component.graph.microsoft.com_users: Displays a set of personas
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, name, properties, grid.area, fallback

Component.graph.microsoft.com_resource: Displays a graph resource
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, name, properties, grid.area, fallback

Component.graph.microsoft.com_file: Displays a file reference
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, name, properties, grid.area, fallback

Component.graph.microsoft.com_event: Displays a calendar event
- key, type, id, requires, lang, isVisible, isVisible.dynamic, separator, height, horizontalAlignment, spacing, targetWidth, isSortKey, name, properties, grid.area, fallback

PersonaProperties: Properties for a single persona
- key, id, userPrincipalName, displayName, iconStyle, style

PersonaSetProperties: Properties for a set of personas
- key, users, iconStyle, style

ResourceProperties: Properties for a graph resource
- key, id, resourceReference, resourceVisualization

ResourceVisualization: Visualization metadata for a resource
- key, media

FileProperties: Properties for a file
- key, name, extension, url

CalendarEventProperties: Properties for a calendar event
- key, id, title, start, end, status, locations, onlineMeetingUrl, isAllDay, extension, url, attendees, organizer

CalendarEventAttendee: Attendee of a calendar event
- key, name, email, title, type, status

Layout.Stack: Default vertical stacking layout
- key, type, targetWidth

Layout.Flow: Wrapping flow layout with configurable item sizing
- key, type, targetWidth, horizontalItemsAlignment, verticalItemsAlignment, itemFit, minItemWidth, maxItemWidth, itemWidth, columnSpacing, rowSpacing

Layout.AreaGrid: CSS Grid-like area layout with named regions
- key, type, targetWidth, columns, areas, columnSpacing, rowSpacing

GridArea: Named area within a Layout.AreaGrid
- key, name, column, columnSpan, row, rowSpan

BackgroundImage: Background image with fill mode and alignment
- key, url, fillMode, horizontalAlignment, verticalAlignment, themedUrls

MediaSource: Media source URL with MIME type
- key, mimeType, url

CaptionSource: Caption source for media with label
- key, mimeType, url, label

TargetElement: Element and visibility state for Action.ToggleVisibility
- key, elementId, isVisible

ThemedUrl: Theme-specific (light/dark) URL
- key, theme, url

IconInfo: Icon descriptor used in CompoundButton
- key, name, size, style, color

HostCapabilities: Declares required host capabilities
- key (plus custom key-value pairs)

SubmitActionData: Data payload for submit/execute actions
- key, msteams, msTeams (plus custom key-value pairs)

ImBackSubmitActionData: Teams imBack action data
- key, type, value

InvokeSubmitActionData: Teams invoke action data
- key, type, value

MessageBackSubmitActionData: Teams messageBack action data
- key, type, text, displayText, value

SigninSubmitActionData: Teams signin action data
- key, type, value

TaskFetchSubmitActionData: Teams task/fetch action data
- key, type

RefreshDefinition: Auto-refresh behavior via Action.Execute
- key, action, userIds

Authentication: SSO/OAuth authentication settings
- key, text, connectionName, buttons, tokenExchangeResource

AuthCardButton: Button for authentication prompts
- key, type, title, image, value

TokenExchangeResource: Token exchange info for SSO
- key, id, uri, providerId

TeamsCardProperties: Teams-specific card settings
- key, width, entities

TeamsSubmitActionProperties: Teams-specific submit action settings
- key, feedback

TeamsSubmitActionFeedback: Feedback configuration for Teams submit actions
- key, hide

TeamsImageProperties: Teams-specific image settings
- key, allowExpand

mention: Teams mention entity
- key, type, text, mentioned

MentionedEntity: Entity (person/tag) being mentioned
- key, id, name, mentionType

CardMetadata: Card metadata including webUrl for Loop unfurling
- key, webUrl

Resources: Card-level string resources for localization
- key, strings

StringResource: Localizable string with default and locale-specific values
- key, defaultValue, localizedValues

AdaptiveCardReference: Citation reference containing an embedded Adaptive Card
- key, type, title, icon, url, keywords, abstract, content

DocumentReference: Citation reference to a document
- key, type, title, icon, url, keywords, abstract


## Properties

key: Optional key for maintaining visual state in host app. (string)

type: Element/action type discriminator constant. (string)

id: Unique identifier; required for inputs to enable validation and value submission. (string)

requires: Host capabilities required; unsupported elements use fallback. Default: {}. (object, custom key-value pairs)

lang: Locale associated with the element. (string)

isVisible: Element visibility. Default: true. (boolean)

isVisible.dynamic: Expression dynamically updating isVisible at runtime. (string)

isSortKey: Whether element is used as sort key. Default: false. (boolean)

grid.area: Name of Layout.AreaGrid area to place element in. (string)

fallback: Alternate element/action if unsupported; "drop" removes element. (element|"drop")

separator: Separator line above element. Default: false. (boolean)

height: Element height. Default: "auto". (string) [auto, stretch]

spacing: Space above element. Default: "Default". (string) [None, ExtraSmall, Small, Default, Medium, Large, ExtraLarge, Padding]

targetWidth: Card width at which element displays. (string) [VeryNarrow, Narrow, Standard, Wide, atLeast:*, atMost:*]

horizontalAlignment: Horizontal alignment. (string) [Left, Center, Right]

selectAction: Action on tap/click; Action.ShowCard not supported. (action) [Action.Execute, Action.OpenUrl, Action.Popover, Action.ResetInputs, Action.RunCommands, Action.Submit, Action.ToggleVisibility]

style: Context-dependent style. Containers: [Default, Emphasis, Accent, Good, Attention, Warning]. Text: [Default, ColumnHeader, Heading]. Images: [Default, Person, RoundedCorners]. Input.ChoiceSet: [Compact, Expanded, Filtered]. Rating: [Default, Compact]. Icons: [Regular, Filled]. Badges: [Default, Subtle, Informative, Accent, Good, Attention, Warning]. Actions: [Default, Positive, Destructive]. Personas: [IconAndName, IconOnly, NameOnly]. (string)

showBorder: Display border around container. Default: false. (boolean)

roundedCorners: Rounded corners on container. Default: false. (boolean)

layouts: Container layouts switching on card width. (array) [Layout.Stack, Layout.Flow, Layout.AreaGrid]

bleed: Container extends into parent padding. Default: false. (boolean)

minHeight: Minimum height. Format: "<number>px". (string)

maxHeight: Maximum height with scrollbar on overflow. Format: "<number>px". (string)

backgroundImage: Container background image URL or BackgroundImage object. (string|BackgroundImage)

verticalContentAlignment: Vertical alignment of container content. (string) [Top, Center, Bottom]

rtl: Right-to-left rendering. (boolean)

minWidth: Minimum width; "auto" or "<number>px". (string)

width: Width as relative weight (number), "auto", "stretch", or "<number>px". (string|number)

text: Text content; supports markdown subset. (string)

text.dynamic: Expression dynamically updating text at runtime. (string)

size: Size value. Text: [Small, Default, Medium, Large, ExtraLarge]. Icons: [xxSmall, xSmall, Small, Standard, Medium, Large, xLarge, xxLarge]. Badges: [Medium, Large, ExtraLarge]. Ratings: [Medium, Large]. TabSet/ImageSet: [Small, Medium, Large]. ProgressRing: [Tiny, Small, Medium, Large]. (string)

weight: Text weight. (string) [Lighter, Default, Bolder]

color: Color value. Text/Icons: [Default, Dark, Light, Accent, Good, Warning, Attention]. Ratings: [Neutral, Marigold]. ProgressBar: [Accent, Good, Warning, Attention]. Charts: see ChartColor. (string)

isSubtle: Use subtler color variant. (boolean)

fontType: Font type. (string) [Default, Monospace]

wrap: Whether text wraps. Default varies by element. (boolean)

maxLines: Maximum lines of text. (number)

labelFor: Id of input this text element labels. (string)

label: Input label for accessibility. (string)

isRequired: Input required for validation. Default: false. (boolean)

errorMessage: Error message on validation failure. (string)

valueChangedAction: Action on input value change. (action) [Action.Popover, Action.ResetInputs, Action.RunCommands]

value: Default/current value. (string|number)

placeholder: Placeholder text when empty. (string)

min: Minimum allowed value/date/time. (string|number)

max: Maximum allowed value/date/time or star count. Default: 5 for ratings, 100 for ProgressBar. (string|number)

title: Display title for actions, buttons, facts, choices, tabs, charts, etc. (string)

title.dynamic: Expression dynamically updating title at runtime. (string)

iconUrl: URL/Base64/icon-name for action icon; "<icon-name>[,regular|filled]" for catalog icons. (string)

mode: Action display mode. Default: "Primary". (string) [Primary, Secondary]

tooltip: Tooltip text on hover. (string)

tooltip.dynamic: Expression dynamically updating tooltip at runtime. (string)

isEnabled: Action enabled state. Default: true. (boolean)

isEnabled.dynamic: Expression dynamically updating isEnabled at runtime. (string)

menuActions: Overflow menu actions for split button. (array) [Action.Execute, Action.OpenUrl, Action.ResetInputs, Action.RunCommands, Action.Submit, Action.ToggleVisibility]

themedIconUrls: Theme-specific icon URLs. (array of ThemedUrl)

data: Data sent to bot on submit/execute; object merges with input values. (string|object)

associatedInputs: Which inputs send values with action. (string) [Auto, None]

conditionallyEnabled: Action enabled only when required inputs filled. Default: false. (boolean)

verb: Action.Execute verb identifier. (string)

url: URL for links, images, media, files, or Loop components. (string)

altText: Alternate text for accessibility. (string)

backgroundColor: Image background color. (string)

allowExpand: Image expandable to full screen. Default: false. (boolean)

themedUrls: Theme-specific image URLs. (array of ThemedUrl)

fitMode: Image fit in bounding box. Default: "Fill". (string) [Cover, Contain, Fill]

horizontalContentAlignment: Horizontal position within bounding box. Default: "Left". (string) [Left, Center, Right]

verticalContentAlignment: Vertical position within bounding box. Default: "Top". (string) [Top, Center, Bottom]

italic: Italicize text. Default: false. (boolean)

strikethrough: Strike through text. Default: false. (boolean)

highlight: Highlight text. Default: false. (boolean)

underline: Underline text. Default: false. (boolean)

images: Images in an ImageSet. (array of Image)

imageSize: Uniform size for ImageSet images. Default: "Medium". (string) [Small, Medium, Large]

sources: Media source URLs. (array of MediaSource)

captionSources: Caption sources for media. (array of CaptionSource)

poster: Poster image URL for media. (string)

mimeType: MIME type of media/caption source. (string)

facts: Key-value pairs in a FactSet. (array of Fact)

columns: Column definitions for Table/ColumnSet or grid sizes for Layout.AreaGrid. (array)

rows: Table rows. (array of TableRow)

cells: Cells in a TableRow. (array of TableCell)

items: Child elements in containers. (array)

inlines: Inline elements in RichTextBlock. (array) [TextRun, IconRun, ImageRun, CitationRun, string]

firstRowAsHeaders: First table row as header. Default: true. (boolean)

showGridLines: Display grid lines in table. Default: true. (boolean)

gridStyle: Grid line style. (string) [Default, Emphasis, Accent, Good, Attention, Warning]

horizontalCellContentAlignment: Default horizontal alignment for cell content. (string) [Left, Center, Right]

verticalCellContentAlignment: Default vertical alignment for cell content. (string) [Top, Center, Bottom]

choices: Choice options for Input.ChoiceSet. (array of Choice)

choices.data: Dynamic data source for choices. (Data.Query)

isMultiSelect: Allow multiple selections. Default: false. (boolean)

useMultipleColumns: Arrange choices in multiple columns (expanded mode). Default: false. (boolean)

minColumnWidth: Minimum column width for multi-column layout. Format: "<number>px". Default: 100px. (string)

dataset: Data.Query dataset identifier. (string)

count: Max items returned by Data.Query (client-set). (number)

skip: Items to skip in Data.Query (client-set). (number)

maxLength: Maximum text input length. (number)

isMultiline: Allow multiple lines of text. Default: false. (boolean)

inlineAction: Button alongside text input. (action)

regex: Regex for text input validation. (string)

valueOn: Value when toggle on. Default: "true". (string)

valueOff: Value when toggle off. Default: "false". (string)

showTitle: Whether title is visually displayed. Default varies. (boolean)

allowHalfSteps: Allow half-star selection. Default: false. (boolean)

name: Icon name, component name, persona name, or grid area name. (string)

icon: Icon name/descriptor; for badges "<icon-name>[,regular|filled]"; for references a FileIconType. (string|IconInfo) [MsWord, MsExcel, MsPowerPoint, MsOneNote, MsSharePoint, MsVisio, MsLoop, MsWhiteboard, Code, Sketch, AdobeIllustrator, AdobePhotoshop, AdobeInDesign, AdobeFlash, Image, Gif, Video, Sound, Zip, Text, PDF]

iconPosition: Badge icon position. Default: "Before". (string) [Before, After]

appearance: Badge appearance. Default: "Filled". (string) [Filled, Tint]

shape: Badge shape. Default: "Circular". (string) [Square, Rounded, Circular]

badge: Badge text on CompoundButton. (string)

description: Description text on CompoundButton. (string)

referenceIndex: 1-based index of cited reference. (number)

card: Inline card shown by Action.ShowCard. (AdaptiveCard)

targetElements: Elements to toggle. (array) [string id or TargetElement]

elementId: Target element id for TargetElement. (string)

targetInputIds: Input ids to reset. (array of string)

commands: Command expressions; supports "<var> := <expr>" assignment. (array of string)

onFailure: Fallback command if Action.RunCommands fails. (string)

content: Content displayed in Action.Popover. (element)

displayArrow: Show arrow toward popover trigger. Default: true. (boolean)

position: Popover position. Default: "Above". (string) [Above, Below, Before, After]

maxPopoverWidth: Maximum popover width. Format: "<number>px". (string)

popoverTitle: Popover title (mobile only). (string)

pageAnimation: Carousel page transition. Default: "Slide". (string) [Slide, CrossFade, None]

pages: Pages in Carousel, TabSet, or Accordion. (array)

tabStyle: Tab display style. Default: "IconAndText". (string) [IconOnly, IconAndText]

iconName: Icon name for tab or accordion header. (string)

headerTitle: Accordion page header text. (string)

headerSize: Accordion header size. Default: "Medium". (string) [Small, Medium, Large, xLarge]

headerWrap: Accordion header text wraps. Default: true. (boolean)

expandIconPosition: Accordion expand icon position. Default: "Start". (string) [Start, Inline, End]

headerIconName: Icon in accordion header. (string)

isExpanded: Accordion page expanded state. Default: false. (boolean)

allowCollapseAllPages: All accordion pages can collapse. Default: true. (boolean)

allowMultipleExpandedPages: Multiple accordion pages can expand. Default: false. (boolean)

actions: Action buttons. (array) [Action.Execute, Action.OpenUrl, Action.Popover, Action.ResetInputs, Action.RunCommands, Action.ShowCard, Action.Submit, Action.ToggleVisibility]

properties: Component-specific properties. (object) [PersonaProperties, PersonaSetProperties, ResourceProperties, FileProperties, CalendarEventProperties]

users: Users in a PersonaSet. (array of PersonaProperties)

userPrincipalName: User principal name. (string)

displayName: Persona display name. (string)

iconStyle: Persona icon style. (string) [ProfilePicture, ContactCard, None]

resourceReference: Key-value pairs referencing a graph resource. (object)

resourceVisualization: Visualization metadata. (ResourceVisualization)

media: Media identifier for resource visualization. (string)

extension: File extension. (string)

start: Event start date/time. (string)

end: Event end date/time. (string)

status: Event or attendee status. (string)

locations: Event locations. (array of string)

onlineMeetingUrl: Online meeting URL. (string)

isAllDay: Event spans all day. (boolean)

attendees: Event attendees. (array of CalendarEventAttendee)

organizer: Event organizer. (CalendarEventAttendee)

email: Attendee email. (string)

theme: Theme name. (string) [Light, Dark]

fillMode: Background image fill. Default: "Cover". (string) [Cover, RepeatHorizontally, RepeatVertically, Repeat]

horizontalItemsAlignment: Flow layout horizontal alignment. Default: "Center". (string) [Left, Center, Right]

verticalItemsAlignment: Flow layout vertical alignment. Default: "Top". (string) [Top, Center, Bottom]

itemFit: Flow layout item fit. Default: "Fit". (string) [Fit, Fill]

minItemWidth: Flow layout min item width. Format: "<number>px". (string)

maxItemWidth: Flow layout max item width. Format: "<number>px". (string)

itemWidth: Flow layout fixed item width. Format: "<number>px". (string)

columnSpacing: Space between columns. Default: "Default". (string) [None, ExtraSmall, Small, Default, Medium, Large, ExtraLarge, Padding]

rowSpacing: Space between rows. Default: "Default". (string) [None, ExtraSmall, Small, Default, Medium, Large, ExtraLarge, Padding]

areas: Named areas in Layout.AreaGrid. (array of GridArea)

column: Grid area start column (1-based). Default: 1. (number)

columnSpan: Grid area column span. Default: 1. (number)

row: Grid area start row (1-based). Default: 1. (number)

rowSpan: Grid area row span. Default: 1. (number)

colorSet: Chart color palette. (string) [Categorical, Sequential, SequentialRed, SequentialGreen, SequentialYellow, Diverging]

maxWidth: Maximum chart width. Format: "<number>px". (string)

xAxisTitle: Chart X axis title. (string)

yAxisTitle: Chart Y axis title. (string)

showLegend: Show chart legend. Default: true. (boolean)

showTitle: Show chart title. Default: false. (boolean)

legend: Legend text for chart data series/points. (string)

x: X axis value for chart data points. (string|number)

y: Y axis value for chart data points. Default: 0. (number)

values: Data point values within a chart series. (array)

stacked: Display grouped bars as stacks. Default: false. (boolean)

showBarValues: Display values on bars. Default: false. (boolean)

yMin: Requested Y axis minimum. (number)

yMax: Requested Y axis maximum. (number)

displayMode: Horizontal bar chart display. Default: "AbsoluteWithAxis". (string) [AbsoluteWithAxis, AbsoluteNoAxis, PartToWhole]

segments: Gauge chart segments. (array of GaugeChartLegend)

subLabel: Gauge chart sub-label. (string)

showMinMax: Show gauge min/max. Default: true. (boolean)

showNeedle: Show gauge needle. Default: true. (boolean)

showOutlines: Show donut/gauge outlines. Default: true. (boolean)

valueFormat: Gauge value format. Default: "Percentage". (string) [Percentage, Fraction]

valueColor: Color of donut center value; see ChartColor. (string)

thickness: Donut segment thickness. Default: "Thick". (string) [Thin, Thick]

codeSnippet: Code text for CodeBlock. (string)

language: Code language. Default: "PlainText". (string) [Bash, C, Cpp, CSharp, CSS, Dos, Go, GraphQL, HTML, Java, JavaScript, JSON, ObjectiveC, Perl, PHP, PlainText, PowerShell, Python, SQL, TypeScript, VbNet, Verilog, VHDL, XML]

startLineNumber: Starting line number for code. Default: 1. (number)

componentUrl: URL of a Loop component. (string)

labelPosition: ProgressRing label position. Default: "Below". (string) [Before, After, Above, Below]

count: Number of votes for Rating display, or max items for Data.Query. (number)

$schema: URL to the Adaptive Card schema. (string)

version: Schema version. Default: "1.0". (string) [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]

fallbackText: Text if card cannot render. (string)

speak: Spoken text for entire card. (string)

refresh: Card auto-refresh config. (RefreshDefinition)

authentication: SSO/OAuth config. (Authentication)

msteams: Teams-specific metadata. (object) [TeamsCardProperties, TeamsSubmitActionProperties, TeamsImageProperties, or submit action data]

msTeams: Equivalent to msteams. (object)

metadata: Card metadata. (CardMetadata)

resources: Card-level localization resources. (Resources)

references: Citation references. (array) [AdaptiveCardReference, DocumentReference]

body: Card body elements. (array)

webUrl: URL for Loop Component unfurling. (string)

strings: String resource map keyed by id. (object)

defaultValue: Default string resource value. (string)

localizedValues: Locale-keyed string values; "<ISO 639-1>(-<ISO 3166-1 alpha-2>)". (object)

abstract: Short summary for citation references. (string)

keywords: Reference keywords; max 3. (array of string)

connectionName: OAuth connection setting identifier. (string)

buttons: Authentication prompt buttons. (array of AuthCardButton)

tokenExchangeResource: SSO token exchange info. (TokenExchangeResource)

image: URL for auth button image. (string)

uri: Application ID/resource for token exchange. (string)

providerId: Identity provider identifier. (string)

entities: Teams mention entities. (array of mention)

mentioned: Entity being mentioned. (MentionedEntity)

mentionType: Mention type. Default: "Person". (string) [Person, Tag]

feedback: Teams submit action feedback config. (TeamsSubmitActionFeedback)

hide: Hide feedback message after action. (boolean)

action: Refresh action. (Action.Execute)

userIds: User ids for automatic refresh. (array of string)