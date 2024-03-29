# API DOC

This is the draft for the REST API.

## API Request: Get Next Action

``` HTML
POST /v1/get_next_action
```

Example:

The JSON request would look like:

```JSON
{
  "user_intent": {
    "intent": "chat",
    "utterance": "Hello"
  },
  "sessionID": "123456789",
  "uid_key": "web-assist-id",
  "prev_turn": {
    "intent": "click",
    "html": "<html><body>Your HTML content</body></html>",
    "metadata": {
      "mouseX": 0,
      "mouseY": 0,
      "tabId": 2011645173,
      "url": "https://www.google.com/search?q=wealthsimple+tax calculator",
      "viewportHeight": 651,
      "viewportWidth": 1366,
      "zoomLevel": 1
    },
    "element": {
      "attributes": {
        "class": "mr-xs",
        "web-assist-id": "44c539a8-1434-4fa6"
      },
      "bbox": {
        "bottom": 522.1875,
        "height": 23,
        "left": 122.5,
        "right": 244.75,
        "top": 499.1875,
        "width": 122.25,
        "x": 122.5,
        "y": 499.1875
      },
      "tagName": "SPAN",
      "xpath": "id(\"main\")/div[1]/div[3]/form[1]/div[1]/div[1]/div[1]/div[5]/div[1]/label[1]/span[1]",
      "textContent": "xxx"
    }
  }
}
```

and the output would be like:

```JSON
{
  "http_code": 200,
  "content_type": "application/json",
  "body": {
    "intent": "click",
    "args": {
      "web-assist-id": "123"
    },
    "element": "//button[@web-assist-id=123]"
  }
}
```

### Request Body

-----------

`user_intent` *dict* **Required**

The `user_intent` should have the field `intent` which should be either `chat` or `continue`. If the `intent` field is set to `chat`, the `utterance` field is expected.

User Chat Intent Example:

```JSON
"user_intent": {
    "intent": "chat",
    "utterance": "user message"
}

```

User Continue Intent Example:

```JSON
"user_intent": {
    "intent": "continue",
}
```

-----------

`sessionID` *str* **Required**

Session ID created by the browser extension. This is used in the backend to track which session, so the turns are continuous.

Example:

``` JSON
"sessionID": "unique_session_id"
```

-----------

`uid_key` *str* **Required**

This the unique id key we use to easily identify each element on the web page. As a prerequisite, we need to tag each element on the active page. For example, if `uid_key` is set to `web-assist-id`, then a link on the active page should go from:

Before:  `<a> Click Here </a>`

After: `<a web-assist-id={unique_id}> Click Here </a>`.

Example:

``` JSON
"uid_key": "web-assist-id"
```

-----------

`prev_turn` *dict* **Optional**

Must have the following field: `intent`

Depending on the `intent`, the following parameters in the response body would also become required.

| `intent` | `required params` | `optional param`|
| :------- | :----- | :-- |
| `change` |  `html`, `metadata`, `element`|`|
| `click` |  `html`, `metadata`, `element` | |
| `load` |   `html`, `metadata` | `properties`|
| `say` |   `utterance` | `html`, `metadata`, |
| `scroll` |   `html`, `metadata`, `scrollX`, `scrollY` | |
| `submit` |  `html`, `metadata`, `element` | |
| `textinput` |  `html`, `metadata`, `element` | |

Examples:

`Say` Intent would look like:

```JSON
{
  "intent": "say",
  "utterance": "Hello"
}
```

`Click` Intent would look like:

```JSON
{
  "intent": "click",
  "html": "<html><body>Your HTML content</body></html>",
  "metadata": {
    "mouseX": 0,
    "mouseY": 0,
    "tabId": 2011645173,
    "url": "https://www.google.com/search?q=wealthsimple+tax calculator",
    "viewportHeight": 651,
    "viewportWidth": 1366,
    "zoomLevel": 1
  },
  "element": {
    "attributes": {
      "class": "mr-xs",
      "{uid_key}": "44c539a8-1434-4fa6"
    },
    "bbox": {
      "bottom": 522.1875,
      "height": 23,
      "left": 122.5,
      "right": 244.75,
      "top": 499.1875,
      "width": 122.25,
      "x": 122.5,
      "y": 499.1875
    },
    "tagName": "SPAN",
    "xpath": "id(\"main\")/div[1]/div[3]/form[1]/div[1]/div[1]/div[1]/div[5]/div[1]/label[1]/span[1]",
    "textContent": "xxx"
  }
}
```

`Load` Intent would look like:

```JSON

{
  "intent": "load",
  "html": "<html><body>Your HTML content</body></html>",
  "metadata": {
    "mouseX": 0,
    "mouseY": 0,
    "tabId": 2011645173,
    "url": "https://www.google.com/search?q=wealthsimple+tax calculator",
    "viewportHeight": 651,
    "viewportWidth": 1366,
    "zoomLevel": 1
  },
  "properties": {
    "transitionType": "generated",
    "transitionQualifiers": ["from_address_bar"]
  }
}
```

Below we discuss the inner fields within `prev_turn`.

-----------
-----------

`element` *dict* **Optional**

**Required** if the `prev_turn` is provided and the `intent` is [`click`, `textinput`, `submit`, `change`]

The following 5 fields must be included: [`attributes`, `bbox`, `tagName`, `xpath` and `textContent`].

`attributes` corresponds to all the attributes the element has.
`bbox` corresponds to the bounding box of the element (8 fields).
`tagName` corresponds to the HTML tag.
`xpath` corresponds to the (absolute / relative) xpath of the element.
`textContent` corresponds to the `.text` of the element.

Example:

```JSON
"element": {
    "attributes": {
        "class": "mr-xs",
        "web-assist-id": "44c539a8-1434-4fa6"
    },
    "bbox": {
        "bottom": 522.1875,
        "height": 23,
        "left": 122.5,
        "right": 244.75,
        "top": 499.1875,
        "width": 122.25,
        "x": 122.5,
        "y": 499.1875
    },
    "tagName": "SPAN",
    "xpath": "id(\"main\")/div[1]/div[3]/form[1]/div[1]/div[1]/div[1]/div[5]/div[1]/label[1]/span[1]",
    "textContent": "xxx"
}
```

-----------

`html` *str* **Optional**

**Required** if the `prev_turn` is provided and the `intent` is not `say`.

The HTML of the active page.

**Note**: This is after each element has the attribute named `uid_key` inserted and tagged with an unique ID.

-----------

`metadata` *dict* **Optional**

**Required** if the `prev_turn` is provided.

The metadata of the browser. There would be the following fields:[ `mouseX`, `mouseY`, `tabID`, `url`, `viewportHeight`, `viewportWidth` , `zoomLevel`].

Example:

```JSON
"metadata": {
    "mouseX": 0,
    "mouseY": 0,
    "tabId": 2011645173,
    "url": "https://www.google.com/search?q=wealthsimple+tax calculator",
    "viewportHeight": 651,
    "viewportWidth": 1366,
    "zoomLevel": 1
}
```

-----------

`properties` *dict* **Optional**

**Encouraged** if the `prev_turn` intent is `load`. Provide the `transitionType` and `transitionQualifiers`. Both are concepts of the Chrome Browser so technically we don't need it, but we our trained on it.

```JSON
"properties": {
    "transitionType" : "generated",
    "transitionQualifiers" : ["from_address_bar"]
  }
```

-----------

`scrollX` *int* **Optional**

**Required** if the `prev_turn` intent is `scroll`.

X position of scroll.

Example:

```JSON
"scrollX": 8, 
```

-----------

`scrollY` *int* **Optional**

**Required** if the `prev_turn` intent is `scroll`.

Y position of scroll.

Example:

```JSON
"scrollY": 344
```

-----------
-----------

### Request Output

The REST API will return in JSON form.

```JSON
{
    "http_code": 200,
    "content_type": "application/json",
    "body" : {...}
}
```

#### HTTP Status Codes

-----------

`200` - Request succeeded. Return the next predicted action.

Here the body would contain the `intent`, `args` and `element`.

`Intent` should be one of the following: [`change`, `click`, `load`, `say`, `scroll`, `submit`, `textinput`].  

For `args` and `element`, they  change based on the `intent`.
| `intent` | `args` | `element` |
| :------- | :----- | :-------- |
| `change` |  `uid`, | `xpath` |
| `click` |  `uid`, | `xpath` |
| `load` |   `url`  | null |
| `say` |   `utterance` | null |
| `scroll` |   `x`, `y` | null |
| `submit` |   `uid`, | `xpath` |
| `textinput` |  `uid`, `text` | `xpath` |

Body Example:

```JSON
{
"intent": "click",
"args": {
    "web-assist-id": "123", 
},
"element": "//button[@web-assist-id=123]"
}
```

-----------

`400` - Client Error. Malformed request syntax.

Body Example:

```JSON
{
"error": "Bad Request",
"message": "Your request is missing a required parameter."
}
```

-----------

`404` - Not Found. Backend server is not up.

-----------

`500` - Backend Error. Will return error message on what failed on the backend if possible.

Body Example:

```JSON
{
"error": "Internal Server Error",
"message": "Could not load candidates."
}
```

-----------
